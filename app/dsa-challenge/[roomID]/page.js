"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import {
  Play,
  Users,
  Trophy,
  Clock,
  Send,
  LogOut,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Copy, Check } from "lucide-react";

const DSAChallengeRoom = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.roomID;
  const userName = searchParams.get("userName");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // User and room state
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [testResults, setTestResults] = useState(null);

  // UI state
  const [remainingTime, setRemainingTime] = useState(0);
  const [activeTab, setActiveTab] = useState("problem");

  // Refs
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const [selectedTopic, setSelectedTopic] = useState(room?.topic || "any");

  // Available languages
  const languages = [
    {
      id: "javascript",
      name: "JavaScript",
      template: "function solution() {\n    // Your code here\n}",
    },
    {
      id: "python",
      name: "Python",
      template: "def solution():\n    # Your code here\n    pass",
    },
    {
      id: "cpp",
      name: "C++",
      template:
        "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
    },
    {
      id: "java",
      name: "Java",
      template:
        "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
    },
    {
      id: "go",
      name: "Go",
      template:
        'package main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n}',
    },
  ];

  useEffect(() => {
    // Check if we have required params
    if (!roomId || !userName) {
      setError("Missing room ID or username");
      setConnectionStatus("error");
      return;
    }

    const storedSessionId = localStorage.getItem(`dsa-session-${roomId}`);
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }

    const newSocket = io("http://localhost:5000/dsa", {
      transports: ["websocket"],
      autoConnect: false,
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      console.log("Connected to DSA namespace");

      // Join the room after connection is established
      newSocket.emit("join-dsa-room", {
        roomId: roomId,
        userName: userName,
        sessionId: storedSessionId || null,
      });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
      console.log("Disconnected from DSA namespace");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("error");
      setError("Failed to connect to server");
    });

    newSocket.on("dsa-room-joined", (data) => {
      console.log("Successfully joined room:", data);

      setRoom(data.room);
      setUser(data.user);
      setUsers(data.users);
      setSessionId(data.sessionId);

      // ✅ Save sessionId per room
      localStorage.setItem(`dsa-session-${data.room.id}`, data.sessionId);

      // ✅ Restore current challenge from backend
      setCurrentChallenge(data.room.currentChallenge);

      // ✅ Restore remaining time
      setRemainingTime(data.room.remainingTime);

      // ✅ Restore user code if exists in localStorage
      const savedCode = localStorage.getItem(
        `code-${data.room.id}-${data.user.id}`
      );
      if (savedCode) {
        setUserCode(savedCode);
      } else if (data.room.currentChallenge) {
        // Set initial code template for current challenge if no saved code
        const lang = languages.find((l) => l.id === selectedLanguage);
        if (lang) setUserCode(lang.template);
      }

      // ✅ Do NOT reset currentChallenge or status manually
    });

    newSocket.on("room-topic-updated", (data) => {
      setSelectedTopic(data.topic);
      // Optionally show a toast: `Topic updated to ${data.topic} by ${data.updatedBy}`
    });

    newSocket.on("dsa-users-list-sync", (data) => {
      setUsers(data.users);
    });

    newSocket.on("new-challenge", (data) => {
      setCurrentChallenge(data.challenge);
      setRemainingTime(data.room.remainingTime);
      setTestResults(null);
      setSubmissions([]);

      // ✅ Update room status to active
      setRoom((prev) => ({
        ...prev,
        status: "active",
        currentChallenge: data.challenge, // Also attach if needed
      }));

      // Reset code to template
      const lang = languages.find((l) => l.id === selectedLanguage);
      if (lang) {
        setUserCode(lang.template);
      }
    });

    newSocket.on("solution-submitted", (data) => {
      setIsSubmitting(false);
      setSubmissions((prev) => [...prev, data.submission]);
    });

    newSocket.on("evaluation-result", (data) => {
      setTestResults(data.testResults);
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === data.submission.id ? { ...sub, ...data.submission } : sub
        )
      );
    });

    newSocket.on("leaderboard-updated", (data) => {
      setLeaderboard(data.leaderboard);
    });
    newSocket.on("challenge-ended", (data) => {
      setRoom(data.room);
      setCurrentChallenge(null);
      setRemainingTime(0);
    });

    newSocket.on("dsa-user-joined", (data) => {
      setUsers(data.users);
    });

    newSocket.on("dsa-user-left", (data) => {
      setUsers(data.users);
    });

    newSocket.on("dsa-user-disconnected", (data) => {
      setUsers(data.users);
    });

    newSocket.on("error", (data) => {
      console.error("Socket error:", data.message);
      setError(data.message);
      setConnectionStatus("error");

      // If it's a room not found error, redirect back to the join page
      if (
        data.message.includes("Room not found") ||
        data.message.includes("does not exist")
      ) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    });

    // Connect to the socket
    newSocket.connect();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      newSocket.disconnect();
    };
  }, [roomId, userName, router]);
  useEffect(() => {
    if (room && user && userCode) {
      localStorage.setItem(`code-${room.id}-${user.id}`, userCode);
    }
  }, [userCode, room, user]);

  // Timer effect
  useEffect(() => {
    if (remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [remainingTime]);

  // Update code template when language changes
  useEffect(() => {
    if (selectedLanguage && !currentChallenge) {
      const lang = languages.find((l) => l.id === selectedLanguage);
      if (lang) {
        setUserCode(lang.template);
      }
    }
  }, [selectedLanguage]);
  const handleCopyRoomId = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const handleGenerateChallenge = () => {
    if (!socket || !room) return;

    socket.emit("generate-challenge", {
      roomId: room.id,
      difficulty: room.difficulty,
      topic: selectedTopic,
    });
  };

  const handleSubmitSolution = () => {
    if (!socket || !room || !currentChallenge || !userCode.trim()) {
      alert("Please write some code before submitting");
      return;
    }

    setIsSubmitting(true);
    socket.emit("submit-solution", {
      roomId: room.id,
      solution: {
        language: selectedLanguage,
        code: userCode,
      },
    });
  };

  const handleLeaveRoom = () => {
    if (!socket || !room) return;

    // Emit leave event to backend
    socket.emit("leave-room", {
      roomId: room.id,
    });

    // Remove sessionId for this room
    localStorage.removeItem(`dsa-session-${room.id}`);

    // Remove saved code for this room and user
    if (user && room) {
      localStorage.removeItem(`code-${room.id}-${user.id}`);
    }

    // Reset all local states
    setRoom(null);
    setUser(null);
    setUsers([]);
    setCurrentChallenge(null);
    setUserCode("");
    setSubmissions([]);
    setLeaderboard([]);
    setTestResults(null);
    setRemainingTime(0);
    setSessionId(null);

    // Disconnect socket
    socket.disconnect();

    // Navigate back to join page
    router.push("/");
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };
  const handleEndChallenge = () => {
    if (!socket || !room) return;
    socket.emit("end-challenge", { roomId: room.id });
  };

  // Loading/error states
  if (connectionStatus === "connecting") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Connecting to room...</h2>
          <p className="text-gray-600">
            Please wait while we connect you to the room.
          </p>
        </div>
      </div>
    );
  }

  if (connectionStatus === "error" || error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">
            {error || "Failed to connect to the room"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Joining room...</h2>
          <p className="text-gray-600">
            Please wait while we set up your room.
          </p>
        </div>
      </div>
    );
  }

  // Main room interface
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{room.name}</h1>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  room.difficulty === "easy"
                    ? "bg-green-100 text-green-800"
                    : room.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {room.difficulty}
              </span>
              {remainingTime > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(remainingTime)}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleCopyRoomId}
              className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy ID
                </>
              )}
            </button>
            {user?.name === room?.createdBy && (
              <div className="flex items-center gap-2">
                <label htmlFor="topic" className="text-sm font-medium">
                  Topic:
                </label>
                <select
                  id="topic"
                  value={selectedTopic}
                  onChange={(e) => {
                    const newTopic = e.target.value;
                    setSelectedTopic(newTopic);
                    socket.emit("set-room-topic", {
                      roomId: room.id,
                      topic: newTopic,
                    });
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="arrays">Arrays</option>
                  <option value="linked-list">Linked List</option>
                  <option value="trees">Trees</option>
                  <option value="graphs">Graphs</option>
                  <option value="dp">Dynamic Programming</option>
                  <option value="strings">Strings</option>
                  <option value="sorting">Sorting</option>
                  <option value="greedy">Greedy</option>
                  <option value="backtracking">Backtracking</option>
                  <option value="bit-manipulation">Bit Manipulation</option>
                  <option value="math">Math</option>
                  <option value="binary-search">Binary Search</option>
                  <option value="two-pointers">Two Pointers</option>
                  <option value="sliding-window">Sliding Window</option>
                  <option value="stack">Stack</option>
                  <option value="queue">Queue</option>
                  <option value="heap">Heap</option>
                  <option value="binary-search-tree">Binary Search Tree</option>
                  <option value="segment-tree">Segment Tree</option>
                  <option value="hash-table">Hash Table</option>
                  <option value="trie">Trie</option>
                  <option value="graph-theory">Graph Theory</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{users.length} / 5</span>
              </div>
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Challenge controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user?.name === room?.createdBy && (
                    <button
                      onClick={
                        room?.currentChallenge && room?.status === "active"
                          ? handleEndChallenge
                          : handleGenerateChallenge
                      }
                      className={`py-2 px-4 rounded-md transition ${
                        room?.currentChallenge && room?.status === "active"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {room?.currentChallenge && room?.status === "active"
                        ? "End Challenge"
                        : "Generate Challenge"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Challenge content */}
            {currentChallenge && (
              <div className="bg-white rounded-lg shadow-sm">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab("problem")}
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "problem"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Problem
                    </button>
                    <button
                      onClick={() => setActiveTab("solution")}
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "solution"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Solution
                    </button>
                    <button
                      onClick={() => setActiveTab("submissions")}
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === "submissions"
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Submissions ({submissions.length})
                    </button>
                  </div>
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {activeTab === "problem" && (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-4">
                          {currentChallenge.title}
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {currentChallenge.description}
                        </p>
                      </div>

                      {currentChallenge.examples && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Examples
                          </h3>
                          {currentChallenge.examples.map((example, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4 mb-3"
                            >
                              <div className="mb-2">
                                <strong>Input:</strong> {example.input}
                              </div>
                              <div>
                                <strong>Output:</strong> {example.output}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {currentChallenge.constraints && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            Constraints
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {currentChallenge.constraints.map(
                              (constraint, index) => (
                                <li key={index} className="text-gray-700">
                                  {constraint}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "solution" && (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">
                          Your Solution
                        </h3>
                        <textarea
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                          className="w-full h-96 font-mono text-sm border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Write your code here..."
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Language:{" "}
                          {
                            languages.find((l) => l.id === selectedLanguage)
                              ?.name
                          }
                        </span>
                        <button
                          onClick={handleSubmitSolution}
                          disabled={isSubmitting || !userCode.trim()}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Solution"}
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "submissions" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Your Submissions
                      </h3>
                      {submissions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                          No submissions yet
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {submissions.map((submission, index) => (
                            <div
                              key={submission.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">
                                    #{index + 1}
                                  </span>
                                  <span
                                    className={`font-medium ${getStatusColor(
                                      submission.status
                                    )}`}
                                  >
                                    {submission.status}
                                  </span>
                                  {submission.status === "accepted" && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  {submission.status === "rejected" && (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    submission.submittedAt
                                  ).toLocaleTimeString()}
                                </span>
                              </div>

                              {submission.score !== undefined && (
                                <div className="text-sm text-gray-600 mb-2">
                                  Score: {submission.score}
                                </div>
                              )}

                              {submission.testResults && (
                                <div className="mt-3">
                                  <h4 className="font-medium mb-2">
                                    Test Results:
                                  </h4>
                                  <div className="space-y-2">
                                    {submission.testResults.map(
                                      (result, testIndex) => (
                                        <div
                                          key={testIndex}
                                          className={`text-sm p-2 rounded ${
                                            result.passed
                                              ? "bg-green-50 text-green-800"
                                              : "bg-red-50 text-red-800"
                                          }`}
                                        >
                                          Test {result.testCase}:{" "}
                                          {result.passed ? "PASSED" : "FAILED"}
                                          {!result.passed && result.status && (
                                            <div className="text-xs mt-1">
                                              {result.status}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Users */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({users.length} / 5)
              </h3>
              <div className="space-y-2">
                {users.map((roomUser) => (
                  <div
                    key={roomUser.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: roomUser.color }}
                    />
                    <span
                      className={`flex-1 ${
                        roomUser.disconnected
                          ? "text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {roomUser.name}
                      {roomUser.id === user?.id && " (you)"}
                    </span>
                    {roomUser.disconnected && (
                      <span className="text-xs text-gray-400">offline</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Leaderboard
              </h3>
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No scores yet</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                    >
                      <span className="font-mono text-sm w-6 text-center">
                        #{index + 1}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.userColor }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{entry.userName}</div>
                        <div className="text-xs text-gray-500">
                          {entry.acceptedSubmissions}/{entry.submissions} solved
                        </div>
                      </div>
                      <span className="font-bold text-blue-600">
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAChallengeRoom;
