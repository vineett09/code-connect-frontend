"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Users, Plus, Hash, User, Settings, Code } from "lucide-react";

const JoinOrCreateRoom = () => {
  const router = useRouter();
  const [formMode, setFormMode] = useState("join"); // 'join' or 'create'
  const [createForm, setCreateForm] = useState({
    roomName: "",
    difficulty: "medium",
    isPrivate: false,
    userName: "",
  });
  const [joinForm, setJoinForm] = useState({
    roomId: "",
    userName: "",
  });
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Optional: You might want to establish a temporary connection
    // to check server status, but it's not strictly necessary here.
    const socket = io("http://localhost:5000/dsa", { autoConnect: false });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!createForm.roomName.trim() || !createForm.userName.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/dsa-rooms/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: createForm.roomName,
            difficulty: createForm.difficulty,
            isPrivate: createForm.isPrivate,
            userName: createForm.userName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Redirect to the new room page
        router.push(
          `/dsa-challenge/${data.room.id}?userName=${encodeURIComponent(
            createForm.userName
          )}`
        );
      } else {
        setError(data.message || "Failed to create room");
      }
    } catch (error) {
      setError("Failed to connect to the server");
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinForm.roomId.trim() || !joinForm.userName.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsJoining(true);
    setError("");

    // Redirect to the room page, passing username as a query param
    router.push(
      `/dsa-challenge/${joinForm.roomId.trim()}?userName=${encodeURIComponent(
        joinForm.userName.trim()
      )}`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formMode === "create") {
      handleCreateRoom();
    } else {
      handleJoinRoom(e);
    }
  };

  const isLoading = formMode === "create" ? isCreating : isJoining;

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
                  {formMode === "join"
                    ? "Join DSA Challenge Room"
                    : "Create New DSA Room"}
                </h2>
                <p className="text-gray-400">
                  {formMode === "join"
                    ? "Enter room details to start collaborating"
                    : "Set up a new DSA challenge session"}
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
                      value={
                        formMode === "join"
                          ? joinForm.userName
                          : createForm.userName
                      }
                      onChange={(e) => {
                        if (formMode === "join") {
                          setJoinForm((prev) => ({
                            ...prev,
                            userName: e.target.value,
                          }));
                        } else {
                          setCreateForm((prev) => ({
                            ...prev,
                            userName: e.target.value,
                          }));
                        }
                        setError("");
                      }}
                      placeholder="Enter your display name"
                      className="w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Room ID Field for Join Mode */}
                {formMode === "join" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Room ID
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="roomId"
                        value={joinForm.roomId}
                        onChange={(e) => {
                          setJoinForm((prev) => ({
                            ...prev,
                            roomId: e.target.value,
                          }));
                          setError("");
                        }}
                        placeholder="Enter room ID"
                        className="w-full pl-12 pr-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Create Room Additional Fields */}
                {formMode === "create" && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Room Name
                      </label>
                      <input
                        type="text"
                        name="roomName"
                        value={createForm.roomName}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            roomName: e.target.value,
                          }));
                          setError("");
                        }}
                        placeholder="e.g., Algorithm Practice Session"
                        className="w-full px-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Difficulty Level
                      </label>
                      <select
                        name="difficulty"
                        value={createForm.difficulty}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            difficulty: e.target.value,
                          }));
                          setError("");
                        }}
                        className="w-full px-4 py-4 bg-slate-700/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                      >
                        <option value="easy" className="bg-slate-800">
                          Easy
                        </option>
                        <option value="medium" className="bg-slate-800">
                          Medium
                        </option>
                        <option value="hard" className="bg-slate-800">
                          Hard
                        </option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={createForm.isPrivate}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            isPrivate: e.target.checked,
                          }));
                          setError("");
                        }}
                        className="w-4 h-4 text-purple-600 bg-slate-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="isPrivate"
                        className="text-sm text-gray-300"
                      >
                        Private Room
                      </label>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (formMode === "join" &&
                      (!joinForm.userName.trim() || !joinForm.roomId.trim())) ||
                    (formMode === "create" &&
                      (!createForm.userName.trim() ||
                        !createForm.roomName.trim()))
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-semibold text-lg transition-all transform disabled:transform-none shadow-lg hover:shadow-2xl hover:shadow-purple-500/25"
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
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected
                          ? "bg-green-400 animate-pulse"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <span>{isConnected ? "Connected" : "Disconnected"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>DSA Challenges</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Collaborative</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinOrCreateRoom;
