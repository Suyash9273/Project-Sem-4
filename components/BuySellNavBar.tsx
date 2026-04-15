import Link from "next/link";
import React from "react";
import { ModeToggle } from "./ModeToggle";

const BuySellNavBar=()=>{
    const userId="12345"; // This would typically come from user authentication context;
    return (
        <nav className="flex items-center gap-6 bg-[#22d3ee] p-4 border-b-4 border-black dark:border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,0.2)] mb-8">
        {/* Logo/Brand Section */}
        <div className="mr-4">
            <span className="text-xl font-black uppercase tracking-tighter text-black">
                Echo-System
            </span>
            <ModeToggle/>
        </div>

        {/* Links */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
                { href: "/item-for-sell", label: "Items for Sell" },
                { href: `/item-for-sell/${userId}`, label: "Your Items" },
                { href: `/purchased-items/${userId}`, label: "Purchased" },
                { href: `/sell-item`, label: "Sell Item", primary: true },
            ].map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`
                        px-4 py-2 text-xs font-black uppercase tracking-tight border-2 border-black 
                        transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${link.primary 
                            ? "bg-[#22c55e] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#16a34a]" 
                            : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100"
                        }
                    `}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    </nav>
    )
}

export default BuySellNavBar;