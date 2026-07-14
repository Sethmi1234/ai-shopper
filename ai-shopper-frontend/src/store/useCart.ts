import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/axios";

export type CartItem = {
  id: number; // DummyJSON product ID
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
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncFromBackend: () => Promise<void>;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,

      syncFromBackend: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) return;

        try {
          set({ isSyncing: true });
          const res = await api.get("/cart");
          const backendItems: CartItem[] = (res.data.items || []).map((item: any) => ({
            id: Number(item.productId),
            title: item.title || "",
            price: item.price || 0,
            quantity: item.quantity || 1,
            thumbnail: item.thumbnail || "",
            _id: item._id,
          }));

          // Merge backend items with local items (backed items take precedence)
          if (backendItems.length > 0) {
            set({ items: backendItems });
          }
        } catch (err) {
          console.warn("Failed to sync cart from backend, using local state", err);
        } finally {
          set({ isSyncing: false });
        }
      },

      addItem: async (item, quantity = 1) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        
        // Optimistically update local state
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

        // Sync to backend if authenticated
        if (token) {
          try {
            const res = await api.post("/cart/items", {
              productId: String(item.id),
              title: item.title,
              price: item.price,
              quantity: quantity,
              thumbnail: item.thumbnail || "",
            });

            // Update local items with MongoDB _ids from response
            if (res.data && res.data.items) {
              const updatedItems: CartItem[] = res.data.items.map((bi: any) => ({
                id: Number(bi.productId),
                title: bi.title || "",
                price: bi.price || 0,
                quantity: bi.quantity || 1,
                thumbnail: bi.thumbnail || "",
                _id: bi._id,
              }));
              set({ items: updatedItems });
            }
          } catch (err) {
            console.warn("Failed to sync cart item to backend", err);
          }
        }
      },

      removeItem: async (id) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const state = get();
        const item = state.items.find((i) => i.id === id);

        // Optimistically update local state
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));

        // Sync to backend if authenticated
        if (token && item?._id) {
          try {
            await api.delete(`/cart/items/${item._id}`);
          } catch (err) {
            console.warn("Failed to remove cart item from backend", err);
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const state = get();
        const item = state.items.find((i) => i.id === id);

        // Optimistically update local state
        set((state) => ({
          items: state.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i))
            .filter((i) => i.quantity > 0),
        }));

        // Sync to backend if authenticated
        if (token && item?._id && quantity > 0) {
          try {
            await api.patch(`/cart/items/${item._id}`, { quantity });
          } catch (err) {
            console.warn("Failed to update cart item in backend", err);
          }
        }
      },

      clearCart: async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        // Optimistically update local state
        set({ items: [] });

        // Sync to backend if authenticated
        if (token) {
          try {
            await api.delete("/cart");
          } catch (err) {
            console.warn("Failed to clear cart in backend", err);
          }
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