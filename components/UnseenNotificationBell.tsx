"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, X, ExternalLink, Inbox } from "lucide-react"
import { useNotifications } from "@/app/store/notifications"

import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"

export interface Notification {
    id: string
    user_id: string
    title: string
    body: string
    is_read: boolean
    is_dismissed: boolean
    link: string
}

const UnseenNotificationBell = () => {
    const { notifications, count, fetchNotifications, dismissNotification, isLoading, markAsRead } = useNotifications()
    const router = useRouter()

    useEffect(() => {
        fetchNotifications()
    }, [])

    return (
        <div className="flex items-center">
            <Dialog>
                {/* The Bell Trigger - Square with heavy shadow */}
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-none border-2 border-black bg-white dark:bg-zinc-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#facc15] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:bg-[#facc15]"
                        onClick={() => markAsRead()}
                    >
                        <Bell className="h-5 w-5 text-black dark:text-white stroke-[2.5px]" />
                        {count > 0 && (
                            <Badge
                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-none border-2 border-black bg-red-500 p-0 text-[10px] font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                variant="destructive"
                            >
                                {count > 9 ? "9+" : count}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>

                {/* The Notification Panel - Blocky and High Contrast */}
                <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-[4px] border-black rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    <DialogHeader className="p-6 pb-4 bg-[#22d3ee] dark:bg-cyan-900 border-b-4 border-black">
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">
                            System Alerts
                        </DialogTitle>
                        <DialogDescription className="text-black/70 dark:text-white/70 font-bold text-xs uppercase tracking-widest">
                            Campus Activity Log
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[400px] w-full px-4 bg-zinc-50 dark:bg-zinc-900">
                        <div className="flex flex-col gap-3 py-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="h-8 w-8 animate-spin border-4 border-black border-t-[#facc15]" />
                                    <p className="text-[10px] font-black uppercase">Syncing...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="group relative flex flex-col gap-2 border-[3px] border-black p-4 bg-white dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-1 pr-6">
                                                <span className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
                                                    {notification.title}
                                                </span>
                                                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-tight">
                                                    {notification.body}
                                                </p>
                                            </div>

                                            {/* Dismiss Button - Retro X */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-none border-2 border-transparent hover:border-black hover:bg-red-100 text-black dark:text-white transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    dismissNotification({ notificationId: notification.id })
                                                }}
                                            >
                                                <X className="h-4 w-4 stroke-[3px]" />
                                            </Button>
                                        </div>

                                        {/* View/Link Button - Stylized like a terminal link */}
                                        {notification.link && (
                                            <Button
                                                variant="link"
                                                className="mt-1 h-auto w-fit p-1 bg-black text-white dark:bg-white dark:text-black rounded-none text-[10px] font-black uppercase tracking-widest hover:no-underline hover:bg-[#facc15] hover:text-black transition-colors"
                                                onClick={() => router.push(notification.link)}
                                            >
                                                Open Entry
                                                <ExternalLink className="ml-1.5 h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="border-4 border-black bg-zinc-100 p-5 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <Inbox className="h-10 w-10 text-black" />
                                    </div>
                                    <p className="text-xs font-black uppercase text-zinc-500">
                                        Log is currently empty
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="bg-black p-2 text-center">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white font-black">
                            --- End of Transmission ---
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UnseenNotificationBell