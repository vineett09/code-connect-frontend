import React from "react";
import { useNotification } from "@/context/NotificationContext";
import Notification from "./Notification";

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-2 left-2 z-50 w-auto sm:top-20 sm:right-4 sm:left-auto sm:max-w-sm">
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
