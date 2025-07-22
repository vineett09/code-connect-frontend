"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Code,
  Users,
  Plus,
  Hash,
  User,
  Copy,
  Check,
  Settings,
} from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export default function EnterRoom() {
  const router = useRouter();
  const [formMode, setFormMode] = useState("join");
  const [formData, setFormData] = useState({
    roomId: "",
    userName: "",
    roomName: "",
    language: "javascript",
  });
  const [generatedRoomId, setGeneratedRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const languages = [
    { id: "javascript", name: "JavaScript", ext: ".js" },
    { id: "python", name: "Python", ext: ".py" },
    { id: "cpp", name: "C++", ext: ".cpp" },
    { id: "c", name: "C", ext: ".c" },
    { id: "csharp", name: "C#", ext: ".cs" },
    { id: "php", name: "PHP", ext: ".php" },
    { id: "go", name: "Go", ext: ".go" },
    { id: "java", name: "Java", ext: ".java" },
    { id: "sql", name: "SQL", ext: ".sql" },
    { id: "bash", name: "Bash", ext: ".sh" },
    { id: "plaintext", name: "Plain Text", ext: ".txt" },
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const generateRoomId = () => {
    const newRoomId = crypto.randomUUID();
    setGeneratedRoomId(newRoomId);
    setFormData((prev) => ({ ...prev, roomId: newRoomId }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleGenerateRoom = () => {
    generateRoomId();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      localStorage.setItem("userName", formData.userName);

      if (formMode === "create") {
        const response = await fetch(`${API_URL}/api/rooms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: formData.roomId,
            roomName: formData.roomName || `${formData.userName}'s Room`,
            language: formData.language,
            userName: formData.userName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create room");
        }

        router.push(`/room/${formData.roomId}`);
      } else {
        const response = await fetch(`${API_URL}/api/rooms/${formData.roomId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Room not found. Please check the room ID.");
          }
          throw new Error("Failed to join room");
        }

        router.push(`/room/${formData.roomId}`);
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
              <button
                onClick={() => setFormMode("join")}
                className={`px-8 py-3 rounded-xl transition-all font-medium ${
                  formMode === "join"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Join Room
              </button>
              <button
                onClick={() => setFormMode("create")}
                className={`px-8 py-3 rounded-xl transition-all font-medium ${
                  formMode === "create"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Create Room
              </button>
            </div>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/30 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {formMode === "join" ? (
                    <Users className="w-8 h-8" />
                  ) : (
                    <Plus className="w-8 h-8" />
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {formMode === "join" ? "Join Coding Room" : "Create New Room"}
                </h2>
                <p className="text-gray-400">
                  {formMode === "join"
                    ? "Enter room details to start collaborating"
                    : "Set up a new collaborative coding session"}
                </p>
              </div>

              <div className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      placeholder="Enter your display name"
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Room ID Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Room ID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleInputChange}
                      placeholder={
                        formMode === "join"
                          ? "Enter room ID"
                          : "Generated automatically"
                      }
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      readOnly={formMode === "create" && !!generatedRoomId}
                    />
                    {formMode === "create" && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
                        {generatedRoomId && (
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleGenerateRoom}
                          className="px-3 py-2 text-xs bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                        >
                          Generate
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Room Additional Fields */}
                {formMode === "create" && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Room Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="roomName"
                        value={formData.roomName}
                        onChange={handleInputChange}
                        placeholder="e.g., Project Phoenix Backend"
                        className="w-full px-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Primary Language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        {languages.map((lang) => (
                          <option
                            key={lang.id}
                            value={lang.id}
                            className="bg-slate-800"
                          >
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.userName || !formData.roomId}
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-semibold text-lg transition-all transform  disabled:transform-none shadow-lg hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {formMode === "join"
                          ? "Joining Room..."
                          : "Creating Room..."}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      {formMode === "join" ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      <span>
                        {formMode === "join"
                          ? "Join Room"
                          : "Create & Enter Room"}
                      </span>
                    </span>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Real-time sync</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Auto-save enabled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Up to 10 users</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
