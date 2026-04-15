"use client"
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "./ui/button";

export default function ChatBar(){
    const router=useRouter()
    const [isOnline,setIsOnline]=useState<boolean>(true)
    return (
        <nav className="flex items-center justify-between p-3 border-b-4 border-black dark:border-white bg-[#facc15] dark:bg-yellow-600 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,0.2)] mb-4">
        {/* Back Button - Retro Style */}
        <Button 
            onClick={() => router.back()}
            className="rounded-none border-2 border-black bg-white text-black font-black uppercase tracking-tighter shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-zinc-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:bg-zinc-200"
        >
            ← Back
        </Button>

        {/* Online/Offline Status Badge */}
        <div className="flex items-center gap-3 px-4 py-1.5 border-2 border-black bg-white dark:bg-zinc-900 shadow-[inset_3px_3px_0_0_rgba(0,0,0,0.1)]">
            {/* Status Light */}
            <div className={`h-3 w-3 rounded-full border-2 border-black animate-pulse ${
                isOnline ? "bg-[#22c55e]" : "bg-red-500"
            }`} />
            
            <span className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
                System: {isOnline ? "Online" : "Offline"}
            </span>
        </div>
    </nav>
    )
}