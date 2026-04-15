import { Notification } from "@/components/UnseenNotificationBell";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";

interface NotificationsProps {
    isLoading: boolean;
    notifications: Notification[];
    count: number;
    fetchNotifications: () => Promise<void>;
    dismissNotification: ({ notificationId }: { notificationId: string }) => Promise<void>;
    markAsRead: () => Promise<void>;
}

//get-notifications
//dismissed-notification
//mark-as-read

export const useNotifications = create<NotificationsProps>((set, get) => ({
    isLoading: false,
    notifications: [],
    count: 0,

    fetchNotifications: async () => {
        try {
            set({ isLoading: true });
            const res = await axios.get('/api/get-notifications');
            const fetchedNotifications: Notification[] = res.data.notifications;

            set({
                notifications: fetchedNotifications,
                // Count only those where is_read is false
                count: fetchedNotifications.filter(n => !n.is_read).length 
            });
        } catch (error) {
            set({ notifications: [], count: 0 });
        } finally {
            set({ isLoading: false });
        }
    },

    dismissNotification: async ({ notificationId }: { notificationId: string }) => {
        const previousNotifications = get().notifications;
        const notificationToDelete = previousNotifications.find(n => n.id === notificationId);
        
        if (!notificationToDelete) return;

        // Optimistic Update
        const updatedNotifications = previousNotifications.filter(n => n.id !== notificationId);
        set({
            notifications: updatedNotifications,
            count: updatedNotifications.filter(n => !n.is_read).length
        });

        try {
            await axios.delete('/api/dismissed-notification', {
                data: { notificationId }
            });
        } catch (error) {
            // Rollback on error
            set({
                notifications: previousNotifications,
                count: previousNotifications.filter(n => !n.is_read).length
            });
            toast.error("Couldn't dismiss notification on the server");
        }
    },

    markAsRead: async () => {
        const previousNotifications = get().notifications;

        // Optimistic Update: Set all to read locally
        set({
            notifications: previousNotifications.map(n => ({ ...n, is_read: true })),
            count: 0
        });

        try {
            await axios.patch('/api/mark-as-read');
        } catch (error) {
            // Rollback: Restore original state
            set({
                notifications: previousNotifications,
                count: previousNotifications.filter(n => !n.is_read).length
            });
        }
    }
}));