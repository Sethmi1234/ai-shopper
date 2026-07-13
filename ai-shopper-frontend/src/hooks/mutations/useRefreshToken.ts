import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "../../services/auth.service";

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshTokenValue: string) => refreshToken(refreshTokenValue),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    },
  });
};