import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";

export type WishlistItem = {
  id: number; // DummyJSON product ID
  title: string;
  price: number;
  thumbnail?: string;
  category?: string;
  rating?: number;
};

type WishlistState = {
  items: WishlistItem[];
  isSyncing: boolean;
  toggleItem: (item: WishlistItem) => Promise<void>;
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  isWishlisted: (id: number) => boolean;
  clearWishlist: () => Promise<void>;
  syncFromBackend: () => Promise<void>;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,

      syncFromBackend: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) return;

        try {
          set({ isSyncing: true });
          const res = await api.get("/wishlist");
          const backendItems: WishlistItem[] = (res.data.products || []).map((item: any) => ({
            id: Number(item.productId),
            title: item.title || "",
            price: item.price || 0,
            thumbnail: item.thumbnail || "",
          }));

          if (backendItems.length > 0) {
            set({ items: backendItems });
          }
        } catch (err) {
          console.warn("Failed to sync wishlist from backend, using local state", err);
        } finally {
          set({ isSyncing: false });
        }
      },

      toggleItem: async (item) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const exists = get().items.find((i) => i.id === item.id);

        if (exists) {
          // Remove
          set((state) => ({ items: state.items.filter((i) => i.id !== item.id) }));
          if (token) {
            try {
              await api.delete(`/wishlist/items/${item.id}`);
            } catch (err) {
              console.warn("Failed to remove wishlist item from backend", err);
            }
          }
        } else {
          // Add
          set((state) => ({ items: [...state.items, item] }));
          if (token) {
            try {
              await api.post("/wishlist/items", {
                productId: String(item.id),
                title: item.title,
                price: item.price,
                thumbnail: item.thumbnail || "",
              });
            } catch (err) {
              console.warn("Failed to add wishlist item to backend", err);
            }
          }
        }
      },

      addItem: async (item) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const exists = get().items.find((i) => i.id === item.id);

        if (!exists) {
          set((state) => ({ items: [...state.items, item] }));
          if (token) {
            try {
              await api.post("/wishlist/items", {
                productId: String(item.id),
                title: item.title,
                price: item.price,
                thumbnail: item.thumbnail || "",
              });
            } catch (err) {
              console.warn("Failed to add wishlist item to backend", err);
            }
          }
        }
      },

      removeItem: async (id) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));

        if (token) {
          try {
            await api.delete(`/wishlist/items/${id}`);
          } catch (err) {
            console.warn("Failed to remove wishlist item from backend", err);
          }
        }
      },

      isWishlisted: (id) => get().items.some((i) => i.id === id),

      clearWishlist: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const currentItems = get().items;

        set({ items: [] });

        if (token) {
          for (const item of currentItems) {
            try {
              await api.delete(`/wishlist/items/${item.id}`);
            } catch (err) {
              console.warn("Failed to clear wishlist item from backend", err);
            }
          }
        }
      },
    }),
    {
      name: "ai-shopper-wishlist",
    }
  )
);

export default useWishlist;