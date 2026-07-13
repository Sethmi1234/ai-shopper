import api from "../lib/axios";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const refreshToken = async (refreshToken: string) => {
  const res = await api.post("/auth/refresh", {
    refreshToken,
    expiresInMins: 60,
  });
  return res.data;
};

export const getAuthUser = async () => {
  const res = await api.get("/auth/me");

  return res.data;
};