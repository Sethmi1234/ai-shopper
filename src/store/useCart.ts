import { create } from "zustand";
import { CartItem as ServiceCartItem } from "@/services/cart.service";

export type CartItem = ServiceCartItem;

// Legacy interface for backward compatibility
// Components should migrate to using React Query hooks directly
type CartState = {
  // Legacy methods - these will be deprecated
  addItem: (item: Omit<CartItem, "quantity" | "id">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

// Note: This store is now a stub for backward compatibility.
// Components should use the React Query hooks from @/hooks/useCart instead.
// The actual cart data is managed by the backend and fetched via React Query.
export const useCart = create<CartState>(() => ({
  addItem: () => {
    console.warn("useCart.addItem is deprecated. Use useAddCartItem hook from @/hooks/useCart instead.");
  },
  removeItem: () => {
    console.warn("useCart.removeItem is deprecated. Use useRemoveCartItem hook from @/hooks/useCart instead.");
  },
  updateQuantity: () => {
    console.warn("useCart.updateQuantity is deprecated. Use useUpdateCartItem hook from @/hooks/useCart instead.");
  },
  clearCart: () => {
    console.warn("useCart.clearCart is deprecated. Use useClearCart hook from @/hooks/useCart instead.");
  },
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
}));

export default useCart;
