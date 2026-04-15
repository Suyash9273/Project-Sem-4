"use client";
import { useItemsStore } from "@/app/store/items-store";
import { useUser } from "@/app/store/user";
import ItemCard from "@/components/ItemCard";
import SellItemForm from "@/components/SellItemForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const RequestedItemsPage = () => {

    const items = useItemsStore((state) => state.requestedItems);
    const fetchItems = useItemsStore((state) => state.fetchRequestedItems);
    const itemsLoading = useItemsStore((state) => state.isLoading);

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchItems();
        }
    }, [fetchItems]);

    // 3. Early return for loading state
    if (itemsLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#f0f9ff] dark:bg-zinc-950 gap-6">
                <div className="relative">
                    <div className="absolute top-1 left-1 h-14 w-14 bg-black dark:bg-white opacity-20"></div>
                    <div className="h-14 w-14 border-[6px] border-black dark:border-white border-t-[#22d3ee] animate-spin rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                </div>
                <div className="bg-[#facc15] border-2 border-black px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                    <p className="text-black font-black uppercase tracking-[0.2em] text-xs animate-pulse">
                        Accessing Portal...
                    </p>
                </div>
                <div className="absolute bottom-10 text-[10px] font-black uppercase text-black/20 dark:text-white/10 tracking-[0.5em] select-none">
                    NITD-MARKETPLACE-CORE-v2.0
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f9ff] dark:bg-zinc-950">
            {/* Main Content Area - Note the pt-32 to clear the absolute header */}
            <div className="container mx-auto p-6 pt-32 lg:p-10 lg:pt-40">
                {items.length > 0 ? (
                    /* The Grid - Increased gap to 10 to let the blocky shadows breathe */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ItemCard item={item} isOwner={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State - Styled like a "System Notice" */
                    <div className="relative flex flex-col items-center justify-center py-24 px-6 border-4 border-black bg-white dark:bg-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center max-w-2xl mx-auto overflow-hidden">
                        {/* Background Decorative Element */}
                        <div className="absolute top-5 left-5 h-20 w-20 bg-[#22d3ee] border-4 border-black -rotate-12 opacity-20"></div>

                        <div className="bg-[#facc15] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 rotate-2">
                            <ShoppingBag className="h-12 w-12 text-black stroke-[3px]" />
                        </div>

                        <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">
                            Marketplace Empty
                        </h2>

                        <p className="text-black/60 dark:text-white/60 mt-4 font-bold uppercase text-sm max-w-sm leading-tight italic">
                            The database is currently clear.
                            <br /> Initialize the first trade entry now.
                        </p>

                        <Button
                            variant="outline"
                            className="mt-10 border-[3px] border-black bg-black text-white hover:bg-[#22c55e] hover:text-black rounded-none font-black uppercase tracking-widest shadow-[5px_5px_0px_0px_rgba(34,211,238,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                            onClick={() => window.location.reload()}
                        >
                            Re-Sync Feed
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestedItemsPage;