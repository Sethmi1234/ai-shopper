"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "@/services/auth.service";

export const useAuthUser = () => {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
};