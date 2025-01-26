"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="animate-pulse text-xl text-gray-600">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="m-0 h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-200 p-0">
      <div className="h-full w-full overflow-y-auto">
        <div className="bg-white shadow-2xl">
          <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <Bell className="mr-4 text-white" size={32} />
            <h1 className="text-3xl font-bold text-white">
              Notifications
              <span className="ml-3 rounded-full bg-white/20 px-3 py-1 text-base">
                {notifications.length}
              </span>
            </h1>
          </div>

          {notifications.length === 0 ? (
            <div className="flex h-[calc(100%-100px)] flex-col items-center justify-center p-8 text-center text-gray-500">
              <Bell className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-xl">No notifications yet</p>
              <p className="text-sm text-gray-400">You re all caught up!</p>
            </div>
          ) : (
            <div className="h-[calc(100%-100px)] divide-y divide-gray-100 overflow-y-auto">
              {notifications.map((notification) => (
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
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { formatDistanceToNow } from "date-fns";
// import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

// interface Notification {
//   id: string;
//   message: string;
//   isRead: boolean;
//   timestamp: string;
//   created_at?: string;
//   type: string;
// }

// const getNotificationIcon = (type: string) => {
//   switch (type.toLowerCase()) {
//     case 'success':
//       return <CheckCircle className="text-green-500" />;
//     case 'error':
//       return <AlertCircle className="text-red-500" />;
//     case 'info':
//       return <Info className="text-blue-500" />;
//     default:
//       return <Bell className="text-gray-500" />;
//   }
// };

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchNotifications() {
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getnotifications`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//             },
//           }
//         );

//         const data = await response.json();
//         const mappedData = data.map((notification: Notification) => ({
//           ...notification,
//           timestamp: notification.created_at,
//         }));

//         setNotifications(mappedData);
//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch notifications", error);
//         setLoading(false);
//       }
//     }

//     fetchNotifications();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen w-full bg-gray-100">
//         <div className="animate-pulse text-xl text-gray-600">
//           Loading notifications...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-0 m-0">
//       <div className="w-full h-full overflow-y-auto">
//         <div className="max-w-full h-full bg-white shadow-2xl">
//           <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 flex items-center">
//             <Bell className="text-white mr-4" size={32} />
//             <h1 className="text-3xl font-bold text-white">
//               Notifications
//               <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-base">
//                 {notifications.length}
//               </span>
//             </h1>
//           </div>

//           {notifications.length === 0 ? (
//             <div className="p-8 text-center text-gray-500 h-[calc(100%-100px)] flex flex-col justify-center items-center">
//               <Bell className="mx-auto mb-4 text-gray-300" size={64} />
//               <p className="text-xl">No notifications yet</p>
//               <p className="text-sm text-gray-400">You're all caught up!</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100 h-[calc(100%-100px)] overflow-y-auto">
//               {notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-5 hover:bg-gray-50 transition-colors duration-200 flex items-start space-x-4
//                     ${!notification.isRead ? "bg-blue-50/50" : ""}`}
//                 >
//                   <div className="mt-1">
//                     {getNotificationIcon(notification.type)}
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex justify-between items-center">
//                       <p className="text-sm font-medium text-gray-800">
//                         {notification.type}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {formatDistanceToNow(new Date(notification.timestamp), {
//                           addSuffix: true,
//                         })}
//                       </p>
//                     </div>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {notification.message}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
