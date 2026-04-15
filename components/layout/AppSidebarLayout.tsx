"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar"; 
import {
  IconArrowLeft,
  IconHome,
  IconMessageCircle,
  IconPlus,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion"; 
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/useUserStore";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const currentUser = useUserStore((state) => state.user);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    useUserStore.getState().setUser(null);
    router.push("/");
  };

  const links = [
    {
      label: "Feed",
      href: "/protected/feed",
      icon: <IconHome className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: "Inbox",
      href: "/protected/inbox",
      icon: <IconMessageCircle className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: "Report Item",
      href: "/protected/report",
      icon: <IconPlus className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
    {
      label: "Profile",
      href: "/protected/profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-200" />,
    },
  ];

  return (
    <div className={cn("flex h-screen w-full flex-col md:flex-row bg-black overflow-hidden")}>
      
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10 bg-zinc-950 border-r border-zinc-800">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 px-2 text-sm text-neutral-200 hover:text-red-400 transition-colors group"
              >
                <IconArrowLeft className="h-5 w-5 shrink-0" />
                <motion.span
                  animate={{ 
                    display: open ? "inline-block" : "none", 
                    opacity: open ? 1 : 0 
                  }}
                  className="whitespace-pre transition-opacity duration-150"
                >
                  Logout
                </motion.span>
              </button>
            </div>
          </div>

          <div>
            <SidebarLink
              link={{
                label: currentUser?.user_metadata?.full_name || "Student",
                href: "/profile",
                icon: (
                  <img
                    src={currentUser?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${currentUser?.email || "User"}&background=random`}
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-y-auto bg-black rounded-tl-2xl border-t border-l border-zinc-800">
        {children}
      </main>
    </div>
  );
}

export const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-violet-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-white tracking-wider"
      >
        CampusConnect
      </motion.span>
    </div>
  );
};