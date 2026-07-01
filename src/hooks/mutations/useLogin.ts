import { useMutation } from "@tanstack/react-query";
import { loginUser, getAuthUser } from "@/services/auth.service";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginUser,

    onSuccess: async (data) => {
      try {
        // Save tokens first
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Call the private Auth Me API
        const authData = await getAuthUser();

        // Save authenticated user data
        localStorage.setItem(
          "authData",
          JSON.stringify(authData)
        );

        console.log("Login successful");
        console.log("Auth Data:", authData);
      } catch (error) {
        console.error("Failed to fetch auth user:", error);
      }
    },
  });
};