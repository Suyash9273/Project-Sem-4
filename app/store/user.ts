// @/app/store/user.ts
import { create } from "zustand";
import { createBrowserClient } from "@supabase/ssr";

interface UserState {
  user: any | null;
  isLoading: boolean;
  init: () => Promise<void>;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  isLoading: true, // Useful for showing skeleton loaders
  init: async () => {
    try {
      set({ isLoading: true });
      const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ) // Browser client doesn't need 'await' usually
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const userPayload = {
          id: user.id,
          user_metadata: {
            full_name: user.user_metadata?.full_name,
            avatar_url: user.user_metadata?.avatar_url,
          }
        };
        set({ user: userPayload, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ user: null, isLoading: false });
    }
  }
}));