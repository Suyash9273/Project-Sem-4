"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, onMessage, Unsubscribe } from "firebase/messaging";
import { fetchToken, messaging } from "@/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserClient } from "@supabase/ssr";

async function getNotificationPermissionAndToken() {
  // Step 1: Check if Notifications are supported in the browser.
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  // Step 2: Check if permission is already granted.
  if (Notification.permission === "granted") {
    return await fetchToken();
  }

  // Step 3: If permission is not denied, request permission from the user.
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await fetchToken();
    }
  }

  console.log("Notification permission not granted.");
  return null;
}

// 1. Pass the supabase client in as a parameter
async function loadTokenInDB(supabase: any, token: string) {
  console.log("Checking session...");
  
  // Use getSession for speed, or getUser for security
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn("No user found, delaying token sync...");
    return false; 
  }
  console.log(user)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('fcm_token')
    .eq('id', user.id)
    .maybeSingle();

  console.log(profile)
    
  if (error) {
    console.error("Profile fetch error:", error);
    return false;
  }
  console.log("Purani fcm token fetched")

  const oldToken = profile?.fcm_token;
  console.log('Old token is : ',oldToken)
  
  // Only call the Edge Function if the token actually changed or is missing
  if (oldToken === token) {
    const payload = oldToken 
      ? { old_token: oldToken, new_token: token, action: 'swap' }
      : { token: token, action: 'add' };

    try {
      console.log("Attempting to invoke edge function...");
      const { data, error: funcError } = await supabase.functions.invoke('manage-topic', {
        body: payload
      });

      if (funcError) {
        console.log("Edge Function logical error:", funcError);
        return false;
      }
      
      console.log('Invoke successful. Data:', data);
    } catch (e) {
      console.log("Critical error during invoke (likely Auth/Network):", e);
      return false;
    }

  }

  // Update DB
  await supabase.from('profiles').update({ fcm_token: token }).eq('id', user.id);
  return true;
}

const useFcmToken = () => {
  const router = useRouter(); // Initialize the router for navigation.
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission | null>(null); // State to store the notification permission status.
  const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
  const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
  const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

  const loadToken = async () => {
    // Step 4: Prevent multiple fetches if already fetched or in progress.
    if (isLoading.current) return;

    isLoading.current = true; // Mark loading as in progress.
    const token = await getNotificationPermissionAndToken(); // Fetch the token.

    // Step 5: Handle the case where permission is denied.
    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      console.info(
        "%cPush Notifications issue - permission denied",
        "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
      );
      isLoading.current = false;
      return;
    }

    // Step 6: Retry fetching the token if necessary. (up to 3 times)
    // This step is typical initially as the service worker may not be ready/installed yet.
    if (!token) {
      if (retryLoadToken.current >= 3) {
        alert("Unable to load token, refresh the browser");
        console.info(
          "%cPush Notifications issue - unable to load token after 3 retries",
          "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
        );
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      console.error("An error occurred while retrieving token. Retrying...");
      isLoading.current = false;
      await loadToken();
      return;
    }

    // Step 7: Set the fetched token and mark as fetched.
    setNotificationPermissionStatus(Notification.permission);
    setToken(token);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const success = await loadTokenInDB(supabase, token);
    if (!success) {
      console.log("Sync failed, will retry on next auth state change or refresh.");
    }
    isLoading.current = false;
  };

  useEffect(() => {
    // Step 8: Initialize token loading when the component mounts.
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      if (!token) return; // Exit if no token is available.

      console.log(`onMessage registered with token ${token}`);
      const m = await messaging();
      if (!m) return;

      // Step 9: Register a listener for incoming FCM messages.
      const unsubscribe = onMessage(m, (payload) => {
        if (Notification.permission !== "granted") return;

        console.log("Foreground push notification received:", payload);
        const link = payload.fcmOptions?.link || payload.data?.link;

        if (link) {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`,
            {
              action: {
                label: "Visit",
                onClick: () => {
                  const link = payload.fcmOptions?.link || payload.data?.link;
                  if (link) {
                    router.push(link);
                  }
                },
              },
            }
          );
        } else {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`
          );
        }

        // --------------------------------------------
        // Disable this if you only want toast notifications.
        // const n = new Notification(
        //   payload.notification?.title || "New message",
        //   {
        //     body: payload.notification?.body || "This is a new message",
        //     data: link ? { url: link } : undefined,
        //   }
        // );

        // // Step 10: Handle notification click event to navigate to a link if present.
        // n.onclick = (event) => {
        //   event.preventDefault();
        //   const link = (event.target as any)?.data?.url;
        //   if (link) {
        //     router.push(link);
        //   } else {
        //     console.log("No link found in the notification payload");
        //   }
        // };
        // --------------------------------------------
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | null = null;

    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    // Step 11: Cleanup the listener when the component unmounts.
    return () => unsubscribe?.();
  }, [token, router, toast]);

  return { token, notificationPermissionStatus }; // Return the token and permission status.
};

export default useFcmToken;