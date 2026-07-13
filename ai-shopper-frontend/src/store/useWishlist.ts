import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: number;
  title: string;
  price: number;
  thumbnail?: string;
  category?: string;
  rating?: number;
};

type WishlistState = {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  clearWishlist: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== item.id) }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      addItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (!exists) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      isWishlisted: (id) => get().items.some((i) => i.id === id),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "ai-shopper-wishlist",
    }
  )
);

export default useWishlist;