import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let onlineUsers: string[] = [];
const socketInit = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? "http://localhost:4002"
          : "https://gl.production-server.tech",
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    console.log("User connected:", userId);
    const isExist = onlineUsers.find((id) => id === userId);
    if (!isExist) {
      onlineUsers.push(userId as string);
    }
    io.emit("onlineUsers", onlineUsers);

    // Handle user disconnecting
    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      onlineUsers = onlineUsers.filter((id) => id !== userId);
      io.emit("onlineUsers", onlineUsers);
    });
  });

  return io;
};

export { onlineUsers, socketInit };