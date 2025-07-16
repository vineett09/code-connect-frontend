// components/challengeRoom/NotificationContainer.js
import React from "react";
import { useNotification } from "@/context/NotificationContext"; // Adjust path if needed
import Notification from "./Notification";

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-sm">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
