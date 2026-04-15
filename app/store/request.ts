import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { useItemsStore } from "./items-store";

export const useRequestStore = create<any>((set, get) => ({
    requestsByItem: [],
    isLoading: false,
    requestStatuses: {},
    fetchRequests: async ({ itemId }: { itemId: string }) => {
        try {
            const response = await axios.get(`/api/requests?itemId=${itemId}`);
            set((state) => ({
                requestsByItem: {
                    ...state.requestsByItem,
                    [itemId]: response.data.requests
                }
            }));
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    },
    addRequest: async ({ itemId }: { itemId: string }) => {
        const itemsStore = useItemsStore.getState();
        const itemToMove = itemsStore.items.find(i => i.id === itemId);
        if (!itemToMove) return;

        // 1. Optimistic Update: Set status ONLY for this specific ID
        set((state) => ({
            requestStatuses: { ...state.requestStatuses, [itemId]: 'PENDING' }
        }));

        useItemsStore.setState({
            items: itemsStore.items.filter(i => i.id !== itemId),
            requestedItems: [itemToMove, ...itemsStore.requestedItems]
        });

        toast.success("Request Sent Successfully");

        try {
            const res = await axios.post(`/api/add-request`, { itemId });
            if (!res.data.success) throw new Error();
        } catch (error) {
            // 2. Rollback specific item status
            set((state) => {
                const newStatuses = { ...state.requestStatuses };
                delete newStatuses[itemId]; // Remove status on failure
                return { requestStatuses: newStatuses };
            });

            const currentItemsStore = useItemsStore.getState();
            useItemsStore.setState({
                items: [itemToMove, ...currentItemsStore.items],
                requestedItems: currentItemsStore.requestedItems.filter(i => i.id !== itemId)
            });
            toast.error("Failed to send request");
        }
    },

    deleteRequest: async ({ itemId }: { itemId: string }) => {
        const itemsStore = useItemsStore.getState();
        const itemToMoveBack = itemsStore.requestedItems.find(i => i.id === itemId);
        if (!itemToMoveBack) return;

        // 1. Optimistic Update: Clear status for this ID
        set((state) => {
            const newStatuses = { ...state.requestStatuses };
            delete newStatuses[itemId];
            return { requestStatuses: newStatuses };
        });

        useItemsStore.setState({
            requestedItems: itemsStore.requestedItems.filter(i => i.id !== itemId),
            items: [itemToMoveBack, ...itemsStore.items]
        });

        toast.success("Request Cancelled");

        try {
            const res = await axios.delete(`/api/delete-request?itemId=${itemId}`);
            if (!res.data.success) throw new Error();
        } catch (error) {
            // 2. Rollback
            set((state) => ({
                requestStatuses: { ...state.requestStatuses, [itemId]: 'PENDING' }
            }));

            const currentItemsStore = useItemsStore.getState();
            useItemsStore.setState({
                requestedItems: [itemToMoveBack, ...currentItemsStore.requestedItems],
                items: currentItemsStore.items.filter(i => i.id !== itemId)
            });
            toast.error("Failed to delete request");
        }
    },
    acceptRequest: async ({ requestId, itemId, buyerId }: { requestId: string, itemId: string, buyerId: string }) => {
        // 1. Get the current state of the ItemsStore
        const itemsStore = useItemsStore.getState();

        // 2. Find the item to ensure it exists in myItems
        const itemExists = itemsStore.myItems.find(i => i.id === itemId);
        if (!itemExists) {
            return;
        }

        // 3. Optimistic Update: Change status to 'RESERVED' inside myItems
        useItemsStore.setState({
            myItems: itemsStore.myItems.map((item) =>
                item.id === itemId
                    ? { ...item, status: 'RESERVED' } // Update target item
                    : item                           // Leave others alone
            )
        });

        toast.success("Request Accepted & Item Reserved");

        try {
            // 4. Make the API call to update the DB
            const res = await axios.put(`/api/accept-request`, {
                requestId,
                itemId,
                buyerId
            });
        } catch (error) {
            // 5. Rollback on failure: Change status back to 'AVAILABLE'
            toast.error("Failed to update item status on server");
            const currentItemsStore = useItemsStore.getState();

            useItemsStore.setState({
                myItems: currentItemsStore.myItems.map((item) =>
                    item.id === itemId
                        ? { ...item, status: 'AVAILABLE' }
                        : item
                )
            });
        }
    },
    unreserveItem: async ({ itemId, buyerId }: { itemId: string, buyerId: string }) => {
        // 1. Get current states for rollback and filtering
        const itemsStore = useItemsStore.getState();
        const previousMyItems = itemsStore.myItems;
        const previousRequestsByItem = get().requestsByItem;
        const previousStatuses = get().requestStatuses;

        // 2. Optimistic Update
        set((state) => ({
            // Remove the specific buyer's request from the local list for this item
            requestsByItem: {
                ...state.requestsByItem,
                [itemId]: state.requestsByItem[itemId]
                    ? state.requestsByItem[itemId].filter((req: any) => req.buyer_id !== buyerId)
                    : []
            }
        }));

        // Update the item status in the items store
        useItemsStore.setState({
            myItems: itemsStore.myItems.map((item) =>
                item.id === itemId ? { ...item, status: 'AVAILABLE' } : item
            )
        });

        toast.success("Item Unreserved");

        try {
            // 3. API Call to update DB (Status -> AVAILABLE, Request -> REJECTED)
            const res = await axios.put(`/api/unreserve-item`, { itemId, buyerId });

            if (!res.data.success) throw new Error("Server failed to unreserve");

        } catch (error) {
            // 5. Rollback on Failure
            toast.error("Failed to sync with server. Rolling back...");

            useItemsStore.setState({ myItems: previousMyItems });
            set({
                requestsByItem: previousRequestsByItem,
                requestStatuses: previousStatuses
            });
        }
    },
    rejectRequest: async ({ itemId, buyerId }: { itemId: string, buyerId: string }) => {
        const previousRequests = { ...get().requestsByItem };

        // 1. Optimistic Update: Remove the request from the local list
        set((state) => ({
            requestsByItem: {
                ...state.requestsByItem,
                [itemId]: state.requestsByItem[itemId]?.filter((req: any) => req.buyer_id !== buyerId) || []
            }
        }));

        toast.success("Request Rejected");

        try {
            // 2. API Call: Updates the request status to 'REJECTED' in DB
            const res = await axios.put(`/api/reject-request`, { itemId, buyerId });
            if (!res.data.success) throw new Error();
        } catch (error) {
            // 3. Rollback on failure
            set({ requestsByItem: previousRequests });
            toast.error("Failed to reject request on server");
        }
    },
    fetchRequestStatuses: async ({userId} : {userId : string}) => {
        try {
            set({ isLoading: true });
            // This API should return an object: { "item_id_1": "PENDING", "item_id_2": "ACCEPTED" }
            const res = await axios.get(`/api/get-user-request-statuses?userId=${userId}`);
            
            if (res.data && res.data.success) {
                set({ requestStatuses: res.data.statuses });
            }
        } catch (error) {
            console.error("Error fetching request statuses:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));