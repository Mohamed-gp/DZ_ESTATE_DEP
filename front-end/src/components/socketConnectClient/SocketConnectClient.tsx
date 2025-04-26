"use client";

import { io } from "socket.io-client";

import useBoundStore from "@/store/store";
import { useEffect } from "react";

const SocketConnectClient = () => {
  const { user } = useBoundStore();

  useEffect(() => {
    if (user?.id) {
      const socket = io(
        process.env.NEXT_PUBLIC_NODE_ENV == "development"
          ? "http://localhost:5000"
          : "https://gl1.production-server.tech",
        {
          auth: { userId: user.id },
        },
      );

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.id]);
  return null;
};
export default SocketConnectClient;
