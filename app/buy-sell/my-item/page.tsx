"use client";

import { useItemsStore } from "@/app/store/items-store";
import { useUser } from "@/app/store/user";
import MyItemCard from "@/components/MyItemCard";
import SellItemForm from "@/components/SellItemForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import UnseenNotificationBell from "@/components/UnseenNotificationBell";
import { ShoppingBag } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const MyItemPage = () => {
  // 1. Use Selectors to prevent unnecessary re-renders
  const user = useUser((state) => state.user);
  const initUser = useUser((state) => state.init);
  const myItems = useItemsStore((state) => state.myItems);
  const fetchMyItem = useItemsStore((state) => state.fetchMyItem);
  const isLoading = useItemsStore((state) => state.isLoading);
  const [open, setOpen] = useState(false);

  // 2. Use a ref to prevent double-fetching in React Strict Mode (Dev)
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      initUser();
      fetchMyItem();
      hasFetched.current = true;
    }
  }, [fetchMyItem, initUser]);

  return (
    <div className="min-h-screen bg-[#f0f9ff] dark:bg-zinc-950 transition-colors duration-300 relative">
      {/* Absolute Slim Header */}
      <div className="absolute top-0 left-0 w-full border-b-4 border-black dark:border-white bg-[#ccfbf1] dark:bg-emerald-900 z-30 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-row justify-between items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-black dark:text-white drop-shadow-[1px_1px_0_px_rgba(255,255,255,0.5)]">
                My Listings
              </h1>
              <div className="hidden md:inline-block bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_px_rgba(0,0,0,1)]">
                <p className="text-black text-[10px] font-black uppercase tracking-widest">
                  Personal Inventory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <UnseenNotificationBell />

              {/* Sell Item Button */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <button className="bg-[#22c55e] hover:bg-[#16a34a] text-black border-[2px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 h-auto text-sm font-black uppercase tracking-tighter transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    + Sell Item
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-white border-[4px] border-black rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
                  <div className="bg-[#22d3ee] p-4 border-b-4 border-black font-black uppercase tracking-widest text-black">
                    New Listing
                  </div>
                  <div className="p-6">
                    <SellItemForm user={user} setOpen={setOpen} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="container mx-auto p-6 pt-32 lg:p-10 lg:pt-40">
        {isLoading ? (
          /* Retro Loading State */
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="h-12 w-12 border-4 border-black border-t-[#22d3ee] animate-spin rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,1)]"></div>
            <p className="font-black uppercase text-xs tracking-widest animate-pulse">Accessing Inventory...</p>
          </div>
        ) : (
          <div>
            {myItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {myItems.map((item, index) => (
                  <div key={item.id || index} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <MyItemCard item={item} isOwner={true} />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State - Retro Warning Style */
              <div className="text-center py-24 bg-white dark:bg-zinc-900 border-[4px] border-black border-dashed shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] max-w-2xl mx-auto">
                <div className="inline-block bg-[#facc15] border-2 border-black p-4 mb-6 -rotate-2">
                  <ShoppingBag className="h-10 w-10 text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">No active listings</h2>
                <p className="text-black/60 dark:text-white/60 font-bold uppercase text-xs max-w-xs mx-auto">
                  You haven't posted any items yet. Start selling to see your inventory here.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyItemPage;