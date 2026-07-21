import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";

export type CartItem = {
  id: string; // Product _id from MongoDB
  title: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  category?: string;
  _id?: string; // MongoDB subdocument ID (set after backend sync)
};

type CartState = {
  items: CartItem[];
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncFromBackend: () => Promise<void>;
  pushToBackend: () => Promise<void>;
};

export const useCart = create<CartState>()(
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
          // First clear the backend cart
          await api.delete("/cart").catch(() => {});
          // Then push each local item
          for (const item of localItems) {
            await api.post("/cart/items", {
              productId: String(item.id),
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              thumbnail: item.thumbnail || "",
            }).catch(() => {});
          }
          // Finally sync from backend to get real _ids
          await get().syncFromBackend();
        } catch (err) {
          console.warn("Failed to push cart to backend", err);
        }
      },

      syncFromBackend: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) return;

        try {
          set({ isSyncing: true });
          const res = await api.get("/cart");
          const backendItems: CartItem[] = (res.data.items || []).map((item: any) => ({
            id: String(item.productId),
            title: item.title || "",
            price: item.price || 0,
            quantity: item.quantity || 1,
            thumbnail: item.thumbnail || "",
            _id: item._id,
          }));

          // Always use backend data as source of truth
          set({ items: backendItems });
        } catch (err) {
          console.warn("Failed to sync cart from backend", err);
        } finally {
          set({ isSyncing: false });
        }
      },

      addItem: async (item, quantity = 1) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (!token) {
          // Not logged in — update local state only
          set((state) => {
            const exists = state.items.find((i) => i.id === item.id);
            if (exists) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity }] };
          });
          return;
        }

        // Logged in — save to backend, then update local state from response
        try {
          const res = await api.post("/cart/items", {
            productId: String(item.id),
            title: item.title,
            price: item.price,
            quantity: quantity,
            thumbnail: item.thumbnail || "",
          });

          if (res.data && res.data.items) {
            const updatedItems: CartItem[] = res.data.items.map((bi: any) => ({
              id: String(bi.productId),
              title: bi.title || "",
              price: bi.price || 0,
              quantity: bi.quantity || 1,
              thumbnail: bi.thumbnail || "",
              _id: bi._id,
            }));
            set({ items: updatedItems });
          }
        } catch (err) {
          console.warn("Failed to add cart item to backend", err);
          throw err;
        }
      },

      removeItem: async (id) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const state = get();
        const item = state.items.find((i) => i.id === id);

        if (!token) {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
          return;
        }

        if (item?._id) {
          try {
            await api.delete(`/cart/items/${item._id}`);
            const res = await api.get("/cart");
            const updatedItems: CartItem[] = (res.data.items || []).map((bi: any) => ({
              id: String(bi.productId),
              title: bi.title || "",
              price: bi.price || 0,
              quantity: bi.quantity || 1,
              thumbnail: bi.thumbnail || "",
              _id: bi._id,
            }));
            set({ items: updatedItems });
          } catch (err) {
            console.warn("Failed to remove cart item from backend", err);
            throw err;
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const state = get();
        const item = state.items.find((i) => i.id === id);

        if (!token) {
          set((state) => ({
            items: state.items
              .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i))
              .filter((i) => i.quantity > 0),
          }));
          return;
        }

        if (item?._id && quantity > 0) {
          try {
            await api.patch(`/cart/items/${item._id}`, { quantity });
            const res = await api.get("/cart");
            const updatedItems: CartItem[] = (res.data.items || []).map((bi: any) => ({
              id: String(bi.productId),
              title: bi.title || "",
              price: bi.price || 0,
              quantity: bi.quantity || 1,
              thumbnail: bi.thumbnail || "",
              _id: bi._id,
            }));
            set({ items: updatedItems });
          } catch (err) {
            console.warn("Failed to update cart item in backend", err);
            throw err;
          }
        }
      },

      clearCart: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (!token) {
          set({ items: [] });
          return;
        }

        try {
          await api.delete("/cart");
          set({ items: [] });
        } catch (err) {
          console.warn("Failed to clear cart in backend", err);
          throw err;
        }
      },

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.quantity * Number(i.price || 0), 0),
    }),
    {
      name: "ai-shopper-cart",
    }
  )
);

export default useCart;
