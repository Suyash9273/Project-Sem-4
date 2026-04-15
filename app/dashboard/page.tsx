"use client"
import useFcmToken from "@/hooks/useFcmToken"
import { BellOff } from "lucide-react"
import { useEffect } from "react"

export default function DashboardPage() {
    const { token, notificationPermissionStatus } = useFcmToken()
    console.log("Token is : ", token)
    return (
        <div className="min-h-screen bg-[#f0f9ff] dark:bg-zinc-950 transition-colors duration-300 relative">
            {/* Absolute Slim Header - Match Image Color #22d3ee */}
            <div className="absolute top-0 left-0 w-full border-b-4 border-black bg-[#22d3ee] z-30 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                <div className="container mx-auto px-6 py-4 flex flex-row justify-between items-center">
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-black">
                        Echo-System
                    </h1>
                    <nav className="hidden md:flex items-center gap-6">
                        {['Home', 'Services', 'About', 'Login'].map((item) => (
                            <a key={item} href="#" className="text-sm font-bold text-black hover:underline underline-offset-4">
                                {item}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 pt-32 lg:pt-40 pb-20">

                {/* Notification Permission Alert - Neo-Brutalist Warning Style */}
                {notificationPermissionStatus === 'denied' && (
                    <div className="mb-12 bg-[#fef2f2] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-red-500 border-2 border-black p-2">
                            <BellOff className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-red-600">System Warning</p>
                            <p className="text-sm font-bold text-black leading-tight">
                                Notifications are disabled. Please enable them in your browser settings to receive campus updates.
                            </p>
                        </div>
                    </div>
                )}

                {/* Hero Text Section */}
                <div className="mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
                        We Are Students Of NIT Delhi,
                    </h2>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-black dark:text-white/80 uppercase">
                        Dedicating this work for college Ecosystem
                    </h3>
                </div>

                {/* Team Grid - Styled exactly like the provided image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { name: "Prashant", role: "NetaJI" },
                        { name: "Suyash", role: "Doing Sports Lately" },
                        { name: "Shivam", role: "I guess I am absent again" }
                    ].map((member, i) => (
                        <div
                            key={i}
                            className="bg-[#ccfbf1] border-[3px] border-black p-10 flex flex-col items-center justify-center text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.02]"
                        >
                            {/* Circular Image with Border */}
                            <div className="w-24 h-24 rounded-full border-[3px] border-black overflow-hidden mb-6 bg-white">
                                <img
                                    src={`/api/placeholder/150/150`} // Replace with actual images
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <h4 className="text-2xl font-black uppercase tracking-tighter text-black mb-2">
                                {member.name}
                            </h4>
                            <p className="text-sm font-bold text-black/70 mb-8 uppercase tracking-tight italic">
                                {member.role}
                            </p>

                            <button className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest px-8 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}