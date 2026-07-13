import { create } from "zustand";
import { WishlistItem as ServiceWishlistItem } from "@/services/wishlist.service";

export type WishlistItem = ServiceWishlistItem;

// Legacy interface for backward compatibility
// Components should migrate to using React Query hooks directly
type WishlistState = {
  // Legacy methods - these will be deprecated
  toggleItem: (item: WishlistItem) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  clearWishlist: () => void;
};

// Note: This store is now a stub for backward compatibility.
// Components should use the React Query hooks from @/hooks/useWishlist instead.
// The actual wishlist data is managed by the backend and fetched via React Query.
export const useWishlist = create<WishlistState>(() => ({
  toggleItem: () => {
    console.warn("useWishlist.toggleItem is deprecated. Use useAddWishlistItem/useRemoveWishlistItem hooks from @/hooks/useWishlist instead.");
  },
  addItem: () => {
    console.warn("useWishlist.addItem is deprecated. Use useAddWishlistItem hook from @/hooks/useWishlist instead.");
  },
  removeItem: () => {
    console.warn("useWishlist.removeItem is deprecated. Use useRemoveWishlistItem hook from @/hooks/useWishlist instead.");
  },
  isWishlisted: () => false,
  clearWishlist: () => {
    console.warn("useWishlist.clearWishlist is deprecated. Use useClearWishlist hook from @/hooks/useWishlist instead.");
  },
}));

export default useWishlist;
