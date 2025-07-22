import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";

const ConnectionStatus = ({ connectionStatus, error }) => {
  const router = useRouter();

  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">
            Connecting to room...
          </h2>
          <p className="text-gray-400 mt-2">
            Please wait while we connect you to the room.
          </p>
        </div>
      </div>
    );
  }

  if (connectionStatus === "error" || error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-lg shadow-xl p-8 max-w-md border border-gray-700">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4 text-white">
            Connection Error
          </h2>
          <p className="text-gray-400 mb-6">
            {error || "Failed to connect to the room"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ConnectionStatus;
