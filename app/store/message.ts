import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";

export interface Message {
    id: string;
    sender_id: string;
    content: string;
    is_image: boolean;
    created_at: string;
    item_id: string;
    is_edited : boolean;
}

interface MessageState {
    isLoading: boolean;
    messages: Message[];
    fetchMessages: ({ itemId }: { itemId: string }) => Promise<void>;
    addMessage: ({ itemId, content, senderId }: { itemId: string, content: string, senderId?: string }) => Promise<void>;
    editMessage: ({ messageId, content }: { messageId: string, content: string }) => Promise<void>;
    deleteMessage: ({ messageId }: { messageId: string }) => Promise<void>;
    addRealtimeMessage: (newMessage: Message) => void;
    updateRealtimeMessage: (newMessage: Message) => void;
    deleteRealtimeMessage: (oldMessageId: string) => void;
}

const sortMessages = (messages: Message[]) => {
    return [...messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
};

export const useMessage = create<MessageState>((set, get) => ({
    isLoading: false,
    messages: [],
    fetchMessages: async ({ itemId }: { itemId: string }) => {
        set({ isLoading: true })
        try {
            const res = await axios.get(`/api/message/get?itemId=${itemId}`)
            set({ messages: sortMessages(res.data.messages) })
        } catch (error) {
            set({ messages: [] })
        } finally {
            set({ isLoading: false })
        }
    },
    addMessage: async ({ itemId, content, senderId }: { itemId: string, content: string, senderId?: string }) => {
        const optimisticId = Math.random().toString(36).substring(2, 9);
        const optimisticMessage = {
            id: optimisticId,
            sender_id: senderId || "",
            content: content,
            is_image: false,
            created_at: new Date().toISOString(),
            item_id: itemId,
            is_edited: false
        }
        
        // Update local state immediately
        set((state) => ({
            messages: sortMessages([...state.messages, optimisticMessage])
        }))

        try {
            const res = await axios.post("/api/message/send", { content, itemId })
            if (res.data.success && res.data.messageId) {
                set((state) => ({
                    messages: state.messages.map((m) => 
                        m.id === optimisticId ? { ...m, id: res.data.messageId } : m
                    )
                }))
            }
        } catch (error) {
            set((state) => ({
                messages: state.messages.filter((m) => m.id !== optimisticId)
            }))
            toast.error("Failed to send message")
        }
    },
    editMessage: async ({ messageId, content }: { messageId: string, content: string }) => {
        const previousMessages = get().messages;
        set((state) => ({
            messages: state.messages.map((m) => 
                m.id === messageId ? { ...m, content, is_edited: true } : m
            )
        }))
        
        try {
            await axios.put("/api/message/edit", { content, messageId })
            toast.success("Message edited")
        } catch (error) {
            set({ messages: previousMessages });
            toast.error("Failed to edit message")
        }
    },
    deleteMessage: async ({ messageId }: { messageId: string }) => {
        const previousMessages = get().messages;
        set((state) => ({
            messages: state.messages.filter((m) => m.id !== messageId)
        }))
        
        try {
            await axios.delete("/api/message/delete", { data: { messageId } })
            toast.success("Message deleted")
        } catch (error) {
            set({ messages: previousMessages });
            toast.error("Failed to delete message")
        }
    },
    addRealtimeMessage: (newMessage: Message) => {
        set((state) => {
            if (state.messages.some(m => m.id === newMessage.id)) return state;
            return { messages: sortMessages([...state.messages, newMessage]) };
        });
    },
    updateRealtimeMessage: (newMessage: Message) => {
        set((state) => ({
            messages: state.messages.map((m) => m.id === newMessage.id ? newMessage : m)
        }))
    },
    deleteRealtimeMessage: (oldMessageId: string) => {
        set((state) => ({
            messages: state.messages.filter((m) => m.id !== oldMessageId)
        }))
    }
}))