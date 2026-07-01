import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser, getAuthUser } from "@/services/auth.service";

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

      // Try to get user data (non-blocking - don't await)
      getAuthUser()
        .then((authData) => {
          localStorage.setItem("authData", JSON.stringify(authData));
        })
        .catch(() => {
          // user fetch is optional, don't block login
        });

      // 🚀 REDIRECT TO DASHBOARD IMMEDIATELY
      router.push("/dashboard");
    },
  });
};
