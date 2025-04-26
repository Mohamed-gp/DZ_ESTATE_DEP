"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useBoundStore from "@/store/store";
import customAxios from "@/utils/customAxios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Image from "next/image";

const InboxPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const { user } = useBoundStore((state) => state);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const newSocket = io(
        process.env.NEXT_PUBLIC_NODE_ENV === "development"
          ? "http://localhost:3005"
          : "https://gl1.production-server.tech",
        {
          auth: { userId: user.id },
        },
      );

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Connected to socket server");
      });

      newSocket.on("new_message", (message) => {
        if (message.room_id === selectedRoom) {
          setMessages((prevMessages) => {
            // Check if the message is already in the state
            if (!prevMessages.some((msg) => msg.id === message.id)) {
              return [...prevMessages, message];
            }
            return prevMessages;
          });
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, selectedRoom]);

  const fetchRooms = async () => {
    try {
      const { data } = await customAxios.get(`/chat/conversations`);
      console.log(data.data);
      setRooms(data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const { data } = await customAxios.get(`/chat/messages/${roomId}`);
      setMessages(data.data);
      setSelectedRoom(roomId);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data } = await customAxios.post(`/chat/messages/send`, {
        room_id: selectedRoom,
        user_id: user.id,
        message: newMessage,
      });

      // Emit the message via socket
      socket.emit("send_message", data.data);

      // Add the message to the state only if it is not already there
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg.id === data.data.id)) {
          return [...prevMessages, data.data];
        }
        return prevMessages;
      });

      setNewMessage("");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.participants.some((participant) =>
      participant.username.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search Rooms"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="col-span-1 rounded-lg bg-white p-4 shadow-md md:col-span-1">
          <div className="flex flex-col gap-4">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <div
                  key={room.room_id}
                  className={`cursor-pointer rounded-lg p-4 ${
                    selectedRoom === room.room_id ? "bg-gray-200" : "bg-white"
                  }`}
                  onClick={() => fetchMessages(room.room_id)}
                >
                  <Image
                    src={room.picture}
                    alt="Room"
                    className="mb-2 h-32 w-full rounded-lg object-cover"
                  />

                  {room.participants
                    .map((participant) => participant.username)
                    .join(", ")}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">You have no rooms</div>
            )}
          </div>
        </div>

        <div className="col-span-1 rounded-lg bg-white p-4 shadow-md md:col-span-3">
          {selectedRoom ? (
            <div className="flex h-full flex-col gap-4 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={`${message.id}-${index}`} // Ensure unique key
                  className={`rounded-lg p-4 ${
                    message.sender_id === user.id
                      ? "self-end bg-blue-500 text-white"
                      : "self-start bg-gray-100"
                  }`}
                >
                  {message.message}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={sendMessage}
                  className="rounded bg-blue-500 px-4 py-2 text-white"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Select a room to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
