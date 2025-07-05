import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
      <p className="text-gray-400 text-lg">Joining room...</p>
    </div>
  );
};
