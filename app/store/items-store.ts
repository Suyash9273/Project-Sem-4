import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { create } from 'zustand';

// Define types to replace 'any' for better stability and IDE support
interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  status: string;
  seller_id: string;
  seller?: { full_name: string; avatar_url: string | null };
  isPending?: boolean;
}

interface ItemsState {
  items: Item[];
  myItems: Item[];
  requestedItems : Item[];
  isLoading: boolean;
  addItem: (newItem: any, currentUser: any) => Promise<void>;
  fetchItems: () => Promise<void>;
  fetchMyItem: () => Promise<void>;
  fetchRequestedItems : ()=>Promise<void>;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  myItems: [],
  requestedItems : [],
  isLoading: false,

  addItem: async (newItem, currentUser) => {
    const tempId = `temp-${Date.now()}`;
    const tempImageUrls = newItem.images.map((file: File) => URL.createObjectURL(file));

    const optimisticItem: Item = {
      id: tempId,
      title: newItem.title,
      description: newItem.description,
      price: newItem.price || 0,
      image_urls: tempImageUrls,
      status: "AVAILABLE",
      seller_id: currentUser?.id || "temp-user-id",
      seller: {
        full_name: currentUser?.user_metadata?.full_name || "Me",
        avatar_url: currentUser?.user_metadata?.avatar_url || null
      },
      isPending: true,
    };

    // Update UI immediately
    set((state) => ({ myItems: [optimisticItem, ...state.myItems] }));

    try {
      const formData = new FormData();
      formData.append('title', newItem.title);
      formData.append('description', newItem.description);
      formData.append('price', newItem.price?.toString() || '0');
      formData.append('tradeType', newItem.tradeType);
      newItem.images.forEach((image: File, index: number) => formData.append(`images[${index}]`, image));

      // FIX: axios already returns parsed data in response.data
      const response = await axios.post('/api/add-item', formData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save');
      }

      const savedItemFromDb = response.data.item;

      set((state) => ({
        myItems: state.myItems.map((item) => (item.id === tempId ? savedItemFromDb : item)),
      }));

      tempImageUrls.forEach((url) => URL.revokeObjectURL(url));
      toast.success("Item added successfully!");

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Backend save failed";
      console.error(msg);
      
      // Rollback
      set((state) => ({ items: state.items.filter((item) => item.id !== tempId) }));
      tempImageUrls.forEach((url) => URL.revokeObjectURL(url));
      toast.error(msg);
    }
  },

  fetchItems: async () => {
    // Only set loading if we don't have items to prevent flicker
    set({ isLoading: true });
    try {
      const res = await axios.get('/api/get-items');
      if (res.data.success) {
        set({ items: res.data.items, isLoading: false });
      }
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      toast.error(axiosError.response?.data?.error || 'Error fetching items');
      set({ isLoading: false });
    }
  },

  fetchMyItem: async () => {
    // Prevent re-fetching if already loading
    if (get().isLoading) return;

    set({ isLoading: true });
    try {
      const res = await axios.get('/api/get-my-item');
      if (res.data && res.data.success) {
        // Only update if data actually changed to prevent render loops
        set({ myItems: res.data.myItems, isLoading: false });
      }
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      toast.error(axiosError.response?.data?.error || 'Error fetching my items');
      set({ isLoading: false });
    }
  },
  fetchRequestedItems: async () => {
    // Prevent re-fetching if already loading
    if (get().isLoading) return;

    set({ isLoading: true });
    try {
      const res = await axios.get('/api/get-requested-items');
      if (res.data && res.data.success) {
        // Only update if data actually changed to prevent render loops
        set({ requestedItems: res.data.items, isLoading: false });
      }
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      toast.error(axiosError.response?.data?.error || 'Error fetching requested items');
      set({ isLoading: false });
    }
  }
}));