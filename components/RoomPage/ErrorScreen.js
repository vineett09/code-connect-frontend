import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export const ErrorScreen = ({ error }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center bg-slate-800 p-8 rounded-lg shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-400 w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-white">Error</h2>
        <p className="text-gray-400 mb-6 max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};
