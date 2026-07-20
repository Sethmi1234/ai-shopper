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
  pushToBackend: () => Promise<void>;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,

      // Push ALL local items to backend (called after login)
      pushToBackend: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) return;
        const localItems = get().items;
        if (localItems.length === 0) return;

        try {
          // Push each local item to backend
          for (const item of localItems) {
            await api.post("/wishlist/items", {
              productId: String(item.id),
              title: item.title,
              price: item.price,
              thumbnail: item.thumbnail || "",
            }).catch(() => {});
          }
          // Sync from backend to get accurate state
          await get().syncFromBackend();
        } catch (err) {
          console.warn("Failed to push wishlist to backend", err);
        }
      },

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

          // Always use backend data as source of truth
          set({ items: backendItems });
        } catch (err) {
          console.warn("Failed to sync wishlist from backend", err);
        } finally {
          set({ isSyncing: false });
        }
      },

      toggleItem: async (item) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const exists = get().items.find((i) => i.id === item.id);

        if (exists) {
          // Remove
          const previousItems = get().items;
          set((state) => ({ items: state.items.filter((i) => i.id !== item.id) }));
          if (token) {
            try {
              await api.delete(`/wishlist/items/${item.id}`);
              const res = await api.get("/wishlist");
              const backendItems: WishlistItem[] = (res.data.products || []).map((bi: any) => ({
                id: Number(bi.productId),
                title: bi.title || "",
                price: bi.price || 0,
                thumbnail: bi.thumbnail || "",
              }));
              set({ items: backendItems });
            } catch (err) {
              console.warn("Failed to remove wishlist item from backend", err);
              set({ items: previousItems });
              throw err;
            }
          }
        } else {
          // Add
          if (token) {
            try {
              const res = await api.post("/wishlist/items", {
                productId: String(item.id),
                title: item.title,
                price: item.price,
                thumbnail: item.thumbnail || "",
              });
              if (res.data && res.data.products) {
                const backendItems: WishlistItem[] = res.data.products.map((bi: any) => ({
                  id: Number(bi.productId),
                  title: bi.title || "",
                  price: bi.price || 0,
                  thumbnail: bi.thumbnail || "",
                }));
                set({ items: backendItems });
              }
            } catch (err) {
              console.warn("Failed to add wishlist item to backend", err);
              throw err;
            }
          } else {
            // Not logged in — update local state only
            set((state) => ({ items: [...state.items, item] }));
          }
        }
      },

      addItem: async (item) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const exists = get().items.find((i) => i.id === item.id);

        if (!exists) {
          if (token) {
            try {
              const res = await api.post("/wishlist/items", {
                productId: String(item.id),
                title: item.title,
                price: item.price,
                thumbnail: item.thumbnail || "",
              });
              if (res.data && res.data.products) {
                const backendItems: WishlistItem[] = res.data.products.map((bi: any) => ({
                  id: Number(bi.productId),
                  title: bi.title || "",
                  price: bi.price || 0,
                  thumbnail: bi.thumbnail || "",
                }));
                set({ items: backendItems });
              }
            } catch (err) {
              console.warn("Failed to add wishlist item to backend", err);
              throw err;
            }
          } else {
            set((state) => ({ items: [...state.items, item] }));
          }
        }
      },

      removeItem: async (id) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (token) {
          try {
            await api.delete(`/wishlist/items/${id}`);
            const res = await api.get("/wishlist");
            const backendItems: WishlistItem[] = (res.data.products || []).map((bi: any) => ({
              id: Number(bi.productId),
              title: bi.title || "",
              price: bi.price || 0,
              thumbnail: bi.thumbnail || "",
            }));
            set({ items: backendItems });
          } catch (err) {
            console.warn("Failed to remove wishlist item from backend", err);
            throw err;
          }
        } else {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        }
      },

      isWishlisted: (id) => get().items.some((i) => i.id === id),

      clearWishlist: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (token) {
          const currentItems = get().items;
          for (const item of currentItems) {
            try {
              await api.delete(`/wishlist/items/${item.id}`);
            } catch (err) {
              console.warn("Failed to clear wishlist item from backend", err);
              throw err;
            }
          }
        }
        set({ items: [] });
      },
    }),
    {
      name: "ai-shopper-wishlist",
    }
  )
);

export default useWishlist;
