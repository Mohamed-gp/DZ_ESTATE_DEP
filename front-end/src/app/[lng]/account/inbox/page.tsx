"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useBoundStore from "@/store/store";
import customAxios from "@/utils/customAxios";
import toast from "react-hot-toast";

const InboxPage = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useBoundStore((state) => state);

  const fetchRooms = async () => {
    try {
      const { data } = await customAxios.get(`/inbox/rooms/${user.id}`);
      setRooms(data.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const { data } = await customAxios.get(`/inbox/messages/${roomId}`);
      setMessages(data.data);
      setSelectedRoom(roomId);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
                  key={room.id}
                  className={`cursor-pointer rounded-lg p-4 ${
                    selectedRoom === room.id ? "bg-gray-200" : "bg-white"
                  }`}
                  onClick={() => fetchMessages(room.id)}
                >
                  {room.name}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">You have no rooms</div>
            )}
          </div>
        </div>

        <div className="col-span-1 rounded-lg bg-white p-4 shadow-md md:col-span-3">
          {selectedRoom ? (
            <div className="flex flex-col gap-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-4 ${
                    message.senderId === user.id
                      ? "self-end bg-blue-500 text-white"
                      : "self-start bg-gray-100"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              <Input
                type="text"
                placeholder="Type a message"
                className="mt-4"
              />
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
