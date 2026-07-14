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
      localStorage.setItem("refreshToken", data.refreshToken || "");

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

      // Sync cart and wishlist from backend
      try {
        const { syncFromBackend: syncCart } = useCart.getState();
        const { syncFromBackend: syncWishlist } = useWishlist.getState();
        await Promise.all([syncCart(), syncWishlist()]);
      } catch (err) {
        console.warn("Failed to sync data from backend after login", err);
      }

      // 🚀 REDIRECT TO DASHBOARD IMMEDIATELY
      router.push("/dashboard");
    },
  });
};