// components/challengeRoom/Notification.js
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-6 h-6 text-green-400" />,
  error: <XCircle className="w-6 h-6 text-red-400" />,
  info: <Info className="w-6 h-6 text-blue-400" />,
  warning: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
};

const Notification = ({ notification, onRemove }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (notification.duration / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [notification.duration]);

  const icon = icons[notification.type] || icons.info;

  return (
    <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg flex items-start p-4 w-full max-w-sm overflow-hidden mb-4 animate-fade-in-right">
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-200">
          {notification.message}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={() => onRemove(notification.id)}
          className="inline-flex text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gray-700 w-full">
        <div
          className={`h-full ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : notification.type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>
    </div>
  );
};

export default Notification;
