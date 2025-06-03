"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  created_at?: string;
  type: string;
}

const getNotificationIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "success":
      return <CheckCircle className="text-green-500" />;
    case "error":
      return <AlertCircle className="text-red-500" />;
    case "info":
      return <Info className="text-blue-500" />;
    default:
      return <Bell className="text-gray-500" />;
  }
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getnotifications`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        );

        const data = await response.json();
        const mappedData = data.map((notification: Notification) => ({
          ...notification,
          timestamp: notification.created_at,
        }));

        setNotifications(mappedData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification) =>
    notification.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-6 text-2xl font-bold">{t("notifications.title")}</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder={t("notifications.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[300px] animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <>
          {filteredNotifications.length === 0 ? (
            <div className="flex h-[calc(100%-100px)] flex-col items-center justify-center p-8 text-center text-gray-500">
              <Bell className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-xl">{t("notifications.noNotifications")}</p>
              <p className="text-sm text-gray-400">
                {t("notifications.allCaughtUp")}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-5 transition-colors duration-200 hover:bg-gray-50 ${!notification.isRead ? "bg-blue-50/50" : ""}`}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">
                        {notification.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
