"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";

// Import the new components
import ConnectionStatus from "@/components/challengeRoom/ConnectionStatus"; // Adjust path as needed
import RoomHeader from "@/components/challengeRoom/RoomHeader";
import MainContent from "@/components/challengeRoom/MainContent";
import Sidebar from "@/components/challengeRoom/Sidebar";

const DSAChallengeRoom = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.roomID;
  const userName = searchParams.get("userName");

  // All state and refs remain here
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [remainingTime, setRemainingTime] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState("any");
  const [isGenerating, setIsGenerating] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

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
      setSubmissions([]);

      // ✅ Update room status to active
      setRoom((prev) => ({
        ...prev,
        status: "active",
        currentChallenge: data.challenge, // Also attach if needed
      }));
      setIsGenerating(false); // ✅ stop loading when challenge arrives

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

    // Add this to your socket event listeners in useEffect
    newSocket.on("evaluation-result", (data) => {
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === data.submission.id ? { ...sub, ...data.submission } : sub
        )
      );

      // Show success/failure notification
      if (data.submission.status === "accepted") {
        // Show success toast/notification
        console.log("✅ Solution accepted!");
      } else {
        // Show failure details
        console.log("❌ Solution rejected:", data.submission.testResults);
      }
    });

    // Add error handling for submission evaluation
    newSocket.on("evaluation-error", (data) => {
      setIsSubmitting(false);
      setError(`Evaluation failed: ${data.message}`);
    });
    // Add error handling for submission evaluation
    newSocket.on("evaluation-error", (data) => {
      setIsSubmitting(false);
      setError(`Evaluation failed: ${data.message}`);
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

    // Update the socket error handling section in your useEffect
    newSocket.on("error", (errorData) => {
      const errorMessage =
        errorData?.message ||
        (typeof errorData === "string" ? errorData : "Unknown socket error");

      console.error("Socket error details:", {
        message: errorMessage,
        data: errorData,
        timestamp: new Date().toISOString(),
      });

      setError(errorMessage);
      setConnectionStatus("error");

      // Only attempt redirect if we have a message and it matches our conditions
      if (
        errorMessage.includes("Room not found") ||
        errorMessage.includes("does not exist")
      ) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    });

    // Add these additional error handlers
    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setError(`Connection failed: ${err.message}`);
      setConnectionStatus("error");
    });

    newSocket.on("connect_timeout", () => {
      console.error("Connection timeout");
      setError("Connection timed out - please check your network");
      setConnectionStatus("error");
    });

    newSocket.on("reconnect_error", (err) => {
      console.error("Reconnection failed:", err.message);
      setError(`Reconnection failed: ${err.message}`);
      setConnectionStatus("error");
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
    if (currentChallenge) {
      const lang = languages.find((l) => l.id === selectedLanguage);
      if (lang) setUserCode(lang.template);
    }
  }, [selectedLanguage, currentChallenge]);
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

  const handleCopyRoomId = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTopicChange = (e) => {
    const newTopic = e.target.value;
    setSelectedTopic(newTopic);
    if (socket) {
      socket.emit("set-room-topic", { roomId: room.id, topic: newTopic });
    }
  };
  const handleGenerateChallenge = () => {
    if (socket) {
      setIsGenerating(true); // ✅ start loading
      socket.emit("generate-challenge", {
        roomId: room.id,
        difficulty: room.difficulty,
        topic: selectedTopic,
      });
    }
  };

  const handleEndChallenge = () => {
    if (socket) socket.emit("end-challenge", { roomId: room.id });
  };
  const handleSubmitSolution = () => {
    if (socket && userCode.trim()) {
      setIsSubmitting(true);
      socket.emit("submit-solution", {
        roomId: room.id,
        solution: { language: selectedLanguage, code: userCode },
      });
    }
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

  if (connectionStatus !== "connected" || error) {
    return (
      <ConnectionStatus connectionStatus={connectionStatus} error={error} />
    );
  }

  if (!room) {
    // A simplified loading state for when connection is fine but room data isn't loaded yet
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Joining room...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <RoomHeader
        room={room}
        user={user}
        users={users}
        remainingTime={remainingTime}
        copied={copied}
        onCopyRoomId={handleCopyRoomId}
        onLeaveRoom={handleLeaveRoom}
        selectedTopic={selectedTopic}
        onTopicChange={handleTopicChange}
        formatTime={formatTime}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <MainContent
            room={room}
            user={user}
            currentChallenge={currentChallenge}
            onGenerateChallenge={handleGenerateChallenge}
            isGenerating={isGenerating}
            onEndChallenge={handleEndChallenge}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            languages={languages}
            userCode={userCode}
            setUserCode={setUserCode}
            isSubmitting={isSubmitting}
            onSubmitSolution={handleSubmitSolution}
            submissions={submissions}
            getStatusColor={getStatusColor}
          />
          <Sidebar
            users={users}
            user={user}
            leaderboard={leaderboard}
            submissions={submissions}
            getStatusColor={getStatusColor}
          />{" "}
        </div>
      </div>
    </div>
  );
};

export default DSAChallengeRoom;
