import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let activeToken: string | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const readStoredAccessToken = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  return token && token !== "undefined" && token !== "null" ? token : null;
};

const isJwtExpired = (token: string) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return true;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    const expiresAt = Number(decoded.exp) * 1000;

    return !expiresAt || Date.now() >= expiresAt - 30_000;
  } catch {
    return true;
  }
};

const refreshAccessToken = async () => {
  try {
    const { refreshToken } = await import("../services/auth.service");
    const data = await refreshToken();
    const token = data?.accessToken;

    if (typeof token === "string" && token.trim()) {
      localStorage.setItem("accessToken", token);
      document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
      return token;
    }
  } catch {
    localStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; max-age=0";
  }

  return null;
};

const getUsableAccessToken = async (currentToken?: string | null) => {
  const token = currentToken || readStoredAccessToken();

  if (token && !isJwtExpired(token)) {
    return token;
  }

  return refreshAccessToken();
};

export const getSocket = (accessToken: string): Socket => {
  if (!socket) {
    activeToken = accessToken;
    socket = io(API_URL, {
      auth: { token: accessToken },
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });
  } else if (activeToken !== accessToken) {
    activeToken = accessToken;
    socket.auth = { token: accessToken };

    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
};

const waitForConnect = (targetSocket: Socket) =>
  new Promise<void>((resolve, reject) => {
    if (targetSocket.connected) {
      resolve();
      return;
    }

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Socket connection timed out."));
    }, 8_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      targetSocket.off("connect", handleConnect);
      targetSocket.off("connect_error", handleConnectError);
    };

    const handleConnect = () => {
      cleanup();
      resolve();
    };

    const handleConnectError = (error: Error) => {
      cleanup();
      reject(error);
    };

    targetSocket.once("connect", handleConnect);
    targetSocket.once("connect_error", handleConnectError);
    targetSocket.connect();
  });

export const getConnectedSocket = async (
  currentToken?: string | null
): Promise<{ socket: Socket; accessToken: string }> => {
  const token = await getUsableAccessToken(currentToken);

  if (!token) {
    throw Object.assign(new Error("Please log in to use the AI assistant."), {
      status: 401,
    });
  }

  let activeSocket = getSocket(token);

  try {
    await waitForConnect(activeSocket);
    return { socket: activeSocket, accessToken: token };
  } catch (error) {
    const refreshedToken = await refreshAccessToken();

    if (!refreshedToken || refreshedToken === token) {
      throw error;
    }

    activeSocket = getSocket(refreshedToken);
    await waitForConnect(activeSocket);
    return { socket: activeSocket, accessToken: refreshedToken };
  }
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  activeToken = null;
};
