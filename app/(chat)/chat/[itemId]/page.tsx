"use client"
import * as React from 'react';
import { Message, useMessage } from "@/app/store/message";
import { useUser } from "@/app/store/user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@supabase/ssr";
import { Edit2, MessageSquare, SendHorizontal, Trash2, ArrowDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function ChatPage({ params }: { params: { itemId: string } }) {
    const [content, setContent] = useState<string>("")
    const { 
        isLoading, 
        fetchMessages, 
        addMessage, 
        editMessage, 
        deleteMessage, 
        messages, 
        addRealtimeMessage, 
        updateRealtimeMessage, 
        deleteRealtimeMessage 
    } = useMessage()
    
    const { user, init } = useUser()
    const [open, setOpen] = useState(false)
    const { itemId } = React.use(params)
    const [editedMessage, setEditedMessage] = useState<string>("")
    
    // --- SCROLL & UNREAD LOGIC ---
    const scrollRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior
            });
            setUnreadCount(0);
        }
    }

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            // threshold of 100px from bottom to consider "at bottom"
            const atBottom = scrollHeight - scrollTop - clientHeight < 100;
            setIsAtBottom(atBottom);
            if (atBottom) setUnreadCount(0);
        }
    }

    useEffect(() => {
        init()
        fetchMessages({ itemId: itemId })
        
        const channel = supabase
            .channel(`item_chat_${itemId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `item_id=eq.${itemId}`,
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === 'INSERT') {
                        const newMessage = newRecord as Message;
                        const isFromMe = newMessage.sender_id === user?.id;

                        addRealtimeMessage(newMessage);

                        if (isFromMe) {
                            // SENDER: Always snap to bottom, no unread badge
                            setTimeout(() => scrollToBottom('auto'), 50);
                        } else {
                            // RECEIVER: Check scroll position
                            setIsAtBottom((currentAtBottom) => {
                                if (!currentAtBottom) {
                                    setUnreadCount(prev => prev + 1);
                                } else {
                                    setTimeout(() => scrollToBottom('smooth'), 50);
                                }
                                return currentAtBottom;
                            });
                        }
                    }
                    else if (eventType === 'UPDATE') {
                        updateRealtimeMessage(newRecord as Message);
                    }
                    else if (eventType === 'DELETE') {
                        deleteRealtimeMessage(oldRecord.id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [itemId, user?.id]);

    // Initial load scroll
    useEffect(() => {
        if (messages.length > 0 && isLoading === false) {
            scrollToBottom('auto');
        }
    }, [isLoading]);

    const editHandler = (messageId: string, e: React.FormEvent) => {
        e.preventDefault()
        setOpen(false)
        editMessage({ messageId: messageId, content: editedMessage })
    }

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border-2 border-black dark:border-white overflow-hidden bg-[#e0f2fe] dark:bg-zinc-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] relative">
    {/* Header - Retro Cyan/Blue */}
    <div className="p-4 border-b-2 border-black dark:border-white bg-[#22d3ee] dark:bg-cyan-900 flex justify-between items-center z-10">
        <h1 className="text-lg font-black uppercase tracking-tighter text-black dark:text-white">
            Chat System
        </h1>
        <div className="text-xs font-bold px-2 py-1 bg-white border border-black text-black">
            {messages.length} MESSAGES
        </div>
    </div>

    {/* Message Area */}
    <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f0f9ff] dark:bg-zinc-900/50 scroll-smooth"
    >
        {isLoading ? (
            <div className="flex items-center justify-center h-full text-black dark:text-white font-bold italic">
                LOADING DATA...
            </div>
        ) : messages.length > 0 ? (
            messages.map((message, index) => {
                const isMe = message.sender_id === user?.id;
                return (
                    <div key={message.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`group relative max-w-[85%] px-4 py-3 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] ${
                            isMe
                                ? "bg-[#86efac] text-black" // Retro Green
                                : "bg-white dark:bg-zinc-800 text-black dark:text-white"
                        }`}>
                            
                            {!isMe && (
                                <div className="text-[10px] font-black mb-1 uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    Recipient
                                </div>
                            )}

                            <div className="text-sm font-medium leading-tight whitespace-pre-wrap break-words">
                                {message.content}
                            </div>

                            <div className={`text-[9px] mt-2 font-bold uppercase opacity-60`}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {message.is_edited && <span className="ml-2">/ EDITED</span>}
                            </div>

                            {/* Action Buttons */}
                            {isMe && (
                                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-7 w-7 bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none" onClick={() => setEditedMessage(message.content)}>
                                                <Edit2 className="h-3 w-3 text-black" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                            <DialogHeader><DialogTitle className="font-black uppercase">Edit Message</DialogTitle></DialogHeader>
                                            <div className="flex flex-col gap-4 py-4">
                                                <Input value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)} className="border-2 border-black focus-visible:ring-0" />
                                                <Button className="bg-black text-white rounded-none hover:bg-zinc-800" onClick={(e) => editHandler(message.id, e)}>Update</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7 bg-red-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none" 
                                        onClick={() => deleteMessage({ messageId: message.id })}
                                    >
                                        <Trash2 className="h-3 w-3 text-black" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-black/40 dark:text-white/40 space-y-2">
                <MessageSquare className="h-12 w-12 stroke-[3px]" />
                <p className="text-sm font-black uppercase">Silence is golden...</p>
            </div>
        )}
    </div>

    {/* --- FLOATING RETRO BUTTON --- */}
    {!isAtBottom && unreadCount > 0 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
            <Button 
                onClick={() => scrollToBottom('smooth')}
                className="rounded-none bg-[#facc15] hover:bg-[#eab308] text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 px-4 py-2 animate-bounce"
            >
                <ArrowDown className="h-4 w-4 stroke-[3px]" />
                <span className="text-xs font-black uppercase">{unreadCount} New Messages</span>
            </Button>
        </div>
    )}

    {/* Input Area */}
    <div className="p-4 border-t-2 border-black dark:border-white bg-white dark:bg-zinc-950 z-10">
        <div className="flex gap-3">
            <Input
                placeholder="TYPE SOMETHING..."
                className="flex-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-none focus-visible:ring-0 text-black dark:text-white font-bold placeholder:text-zinc-400"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
                value={content}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && content.trim()) {
                        addMessage({ itemId, content, senderId: user.id });
                        setContent("");
                    }
                }}
            />
            <Button
                size="icon"
                disabled={!content.trim()}
                onClick={() => {
                    addMessage({ itemId, content, senderId: user.id });
                    setContent("");
                }}
                className="rounded-none w-12 h-10 bg-[#22c55e] hover:bg-[#16a34a] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
                <SendHorizontal className="h-5 w-5 text-black" />
            </Button>
        </div>
    </div>
</div>
    )
}