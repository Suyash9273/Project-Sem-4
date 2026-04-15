"use client";
import { useItemsStore } from "@/app/store/items-store";
import ItemCard from "@/components/ItemCard";
import SellItemForm from "@/components/SellItemForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingBag } from "lucide-react";
import { useEffect, useRef } from "react";
import UnseenNotificationBell from "@/components/UnseenNotificationBell";

const ItemsPage = () => {
    const items = useItemsStore((state) => state.items);
    const fetchItems = useItemsStore((state) => state.fetchItems);
    const itemsLoading = useItemsStore((state) => state.isLoading);

    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            fetchItems();
        }
    }, [fetchItems]);

    if (itemsLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-[#f0f9ff] dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-6 p-10 border-[4px] border-black dark:border-white bg-white dark:bg-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">

                    {/* Retro Spinner - Thick borders, no transparency */}
                    <div className="relative h-16 w-16">
                        <div className="absolute inset-0 animate-spin rounded-none border-[6px] border-zinc-200 dark:border-zinc-800 border-t-[#22d3ee] border-r-[#22c55e]"></div>
                        <div className="absolute inset-2 animate-spin-slow rounded-none border-[4px] border-black dark:border-white opacity-20"></div>
                    </div>

                    <div className="space-y-2 text-center">
                        <p className="text-xl font-black uppercase tracking-tighter text-black dark:text-white animate-pulse">
                            Fetching Data...
                        </p>

                        {/* Retro Progress Bar Mockup */}
                        <div className="w-48 h-4 border-2 border-black bg-zinc-100 overflow-hidden">
                            <div className="h-full bg-[#facc15] w-2/3 animate-[loading_2s_ease-in-out_infinite] border-r-2 border-black"></div>
                        </div>

                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mt-4">
                            NIT Delhi Digital Ecosystem
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f9ff] dark:bg-zinc-950 transition-colors duration-300 relative">
            {/* Header Section - Now Absolute and Slimmer */}
            <div className="absolute top-0 left-0 w-full border-b-4 border-black dark:border-white bg-[#22d3ee] dark:bg-cyan-900 z-30 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <div className="container mx-auto px-6 py-4"> {/* Reduced padding from py-8 to py-4 */}
                    <div className="flex flex-row justify-between items-center gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-black dark:text-white drop-shadow-[1px_1px_0_px_rgba(255,255,255,0.5)]">
                                Marketplace
                            </h1>
                            <div className="hidden md:inline-block bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0_px_rgba(0,0,0,1)]">
                                <p className="text-black text-[10px] font-black uppercase tracking-widest">
                                    NIT Delhi Community
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <UnseenNotificationBell />

                            {/* Slimmer Sell Item Button */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#22c55e] hover:bg-[#16a34a] text-black border-[2px] border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 h-auto text-sm font-black uppercase tracking-tighter transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                        <Plus className="mr-1 h-4 w-4 stroke-[3px]" />
                                        <span className="hidden sm:inline">Sell Item</span>
                                        <span className="sm:hidden">Sell</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] bg-white border-[4px] border-black rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
                                    <div className="bg-[#22d3ee] p-4 border-b-4 border-black font-black uppercase tracking-widest text-black">
                                        New Listing
                                    </div>
                                    <div className="p-6">
                                        <SellItemForm />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section - Added pt-32 to clear the absolute header */}
            <main className="container mx-auto p-6 pt-32 lg:p-10 lg:pt-40">
                {items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="transition-transform duration-200 hover:scale-[1.02]"
                            >
                                <ItemCard item={item} isOwner={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-6 border-[4px] border-black border-dashed bg-white dark:bg-zinc-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] text-center max-w-2xl mx-auto">
                        <div className="bg-[#facc15] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 rotate-3">
                            <ShoppingBag className="h-10 w-10 text-black stroke-[3px]" />
                        </div>
                        <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">
                            No listings found
                        </h2>
                        <Button
                            variant="outline"
                            className="mt-6 border-2 border-black rounded-none font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Refresh
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ItemsPage;