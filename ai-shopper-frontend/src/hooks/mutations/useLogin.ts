import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser, getAuthUser } from "../../services/auth.service";
import { useCart } from "../../store/useCart";
import { useWishlist } from "../../store/useWishlist";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: async (data) => {
      // Save tokens to localStorage (for API interceptors)
      const token = data.accessToken || data.token;
      localStorage.setItem("accessToken", token);

      // Also save to cookie so Next.js middleware can enforce auth server-side
      document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;

      // Save user info from login response
      if (data.user) {
        localStorage.setItem("userName", data.user.name || "");
        localStorage.setItem("userEmail", data.user.email || "");
      }

      // Try to get user data (non-blocking - don't await)
      getAuthUser()
        .then((authData) => {
          localStorage.setItem("authData", JSON.stringify(authData));
          if (authData.user) {
            localStorage.setItem("userName", authData.user.name || "");
            localStorage.setItem("userEmail", authData.user.email || "");
          }
        })
        .catch(() => {
          // user fetch is optional, don't block login
        });

      // FIRST: Push any local items to backend, THEN sync from backend
      try {
        const cartStore = useCart.getState();
        const wishlistStore = useWishlist.getState();

        // Push local items to backend
        await Promise.all([
          cartStore.pushToBackend(),
          wishlistStore.pushToBackend(),
        ]);

        // Then sync from backend to get accurate state
        await Promise.all([
          cartStore.syncFromBackend(),
          wishlistStore.syncFromBackend(),
        ]);
      } catch (err) {
        console.warn("Failed to sync data from backend after login", err);
      }

      // 🚀 REDIRECT TO DASHBOARD IMMEDIATELY
      router.push("/dashboard");
    },
  });
};