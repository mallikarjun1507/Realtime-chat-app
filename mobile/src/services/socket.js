import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";
import { getToken } from "../utils/storage";

let socket = null;

export const getSocket = async () => {
  if (socket && socket.connected) return socket;

  const token = await getToken();

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"], // Force only websocket
    forceNew: true,
  });

  socket.on("connect_error", (err) => {
    console.log(" Socket connection error:", err.message);
  });

  socket.on("connect", () => {
    console.log(" Connected to socket server:", SOCKET_URL);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
};
