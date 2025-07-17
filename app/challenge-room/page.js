"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { io } from "socket.io-client";
import {
  Users,
  Plus,
  Hash,
  User,
  Settings,
  Code,
  X,
  LogIn,
  LogOut,
} from "lucide-react";

const JoinOrCreateRoom = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
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
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auto-fill username when session is available
  useEffect(() => {
    if (session?.user) {
      const displayName =
        session.user.name || session.user.email || "Anonymous";
      setCreateForm((prev) => ({ ...prev, userName: displayName }));
      setJoinForm((prev) => ({ ...prev, userName: displayName }));
    }
  }, [session]);

  // Check authentication status and show modal if needed
  useEffect(() => {
    if (status === "unauthenticated") {
      setShowLoginModal(true);
    } else if (status === "authenticated") {
      setShowLoginModal(false);
    }
  }, [status]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000/dsa", { autoConnect: false });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

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
            userId: session.user.id || session.user.email, // Include user ID
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
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

    if (!session) {
      setShowLoginModal(true);
      return;
    }

    if (!joinForm.roomId.trim() || !joinForm.userName.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsJoining(true);
    setError("");

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

  const handleLogin = async (provider) => {
    try {
      await signIn(provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isLoading = formMode === "create" ? isCreating : isJoining;

  // Login Modal Component
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Sign In Required</h3>
          <button
            onClick={() => setShowLoginModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-300 mb-6">
          Please sign in to create or join DSA challenge rooms.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin("google")}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Login Modal */}
      {showLoginModal && <LoginModal />}

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
                      disabled={isLoading || !session}
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
                        disabled={isLoading || !session}
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
                        disabled={isLoading || !session}
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
                        disabled={isLoading || !session}
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
                        disabled={isLoading || !session}
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
                    !session ||
                    isLoading ||
                    (formMode === "join" &&
                      (!joinForm.userName.trim() || !joinForm.roomId.trim())) ||
                    (formMode === "create" &&
                      (!createForm.userName.trim() ||
                        !createForm.roomName.trim()))
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-semibold text-lg transition-all transform disabled:transform-none shadow-lg hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  {!session ? (
                    <span className="flex items-center justify-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>Sign In to Continue</span>
                    </span>
                  ) : isLoading ? (
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
                        session ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                      }`}
                    ></div>
                    <span>{session ? "Authenticated" : "Not Signed In"}</span>
                  </div>
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
