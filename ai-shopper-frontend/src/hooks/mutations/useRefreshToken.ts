import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "../../services/auth.service";

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => refreshToken(),
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
    },
  });
};