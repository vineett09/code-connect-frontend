"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

import ConnectionStatus from "@/components/challengeRoom/ConnectionStatus";
import RoomHeader from "@/components/challengeRoom/RoomHeader";
import MainContent from "@/components/challengeRoom/MainContent";
import Sidebar from "@/components/challengeRoom/Sidebar";
import {
  NotificationProvider,
  useNotification,
} from "@/context/NotificationContext";
import NotificationContainer from "@/components/challengeRoom/NotificationContainer";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DSAChallengeRoom = () => {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addNotification } = useNotification();

  const roomId = params.roomID;
  const userName = searchParams.get("userName");

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
  const isReady = session && roomId && userName;
  const [shouldSetTemplate, setShouldSetTemplate] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const [aiGenerationError, setAiGenerationError] = useState(null);
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);
  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python" },
    { id: "cpp", name: "C++" },
    { id: "java", name: "Java" },
    { id: "go", name: "Go" },
  ];

  useEffect(() => {
    if (!isReady) return;

    const storedSessionId = localStorage.getItem(`dsa-session-${roomId}`);
    if (storedSessionId) {
      setSessionId(storedSessionId);
      console.log("Using stored sessionId:", storedSessionId);
    }

    const newSocket = io(`${API_URL}/dsa`, {
      transports: ["websocket"],
      upgrade: false,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnectionStatus("connected");
      console.log("✅ Connected to DSA namespace");

      newSocket.emit("join-dsa-room", {
        roomId: roomId,
        userName: userName,
        sessionId: storedSessionId || null,
        userEmail: session.user.email,
      });
    });

    newSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      addNotification(
        "Disconnected from the server. Attempting to reconnect...",
        "error"
      );

      console.log("❌ Disconnected from DSA namespace");
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

      localStorage.setItem(`dsa-session-${data.room.id}`, data.sessionId);

      setCurrentChallenge(data.room.currentChallenge);
      setRemainingTime(data.room.remainingTime);

      if (data.userCode && data.userCode.trim() !== "") {
        setUserCode(data.userCode);
        setShouldSetTemplate(false);
      } else if (data.room.currentChallenge) {
        const lang = languages.find((l) => l.id === selectedLanguage);
        if (lang && lang.template) {
          setUserCode(lang.template || "");
          setShouldSetTemplate(false);
        } else {
          setUserCode("");
          setShouldSetTemplate(false);
        }
      } else {
        setUserCode("");
        setShouldSetTemplate(false);
      }

      if (data.submissions) {
        setSubmissions(data.submissions);
      }

      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });
    // Listen for generic notifications from the server
    newSocket.on("notification", ({ type, message }) => {
      addNotification(message, type);
    });
    newSocket.on("room-topic-updated", (data) => {
      setSelectedTopic(data.topic);
    });

    newSocket.on("dsa-users-list-sync", (data) => {
      setUsers(data.users);
    });

    newSocket.on("new-challenge", (data) => {
      setCurrentChallenge(data.challenge);
      setRemainingTime(data.room.remainingTime);
      setSubmissions([]);

      setRoom((prev) => ({
        ...prev,
        status: "active",
        currentChallenge: data.challenge,
      }));
      setIsGenerating(false);

      // Set the AI-generated template for the selected language
      if (
        data.challenge.template &&
        data.challenge.template[selectedLanguage]
      ) {
        setUserCode(data.challenge.template[selectedLanguage]);
      }
    });
    newSocket.on("ai-generation-failed", (data) => {
      setIsGenerating(false);
      setAiGenerationError(data.error);

      setTimeout(() => {
        setAiGenerationError(null);
      }, 5000);
    });

    newSocket.on("solution-submitted", (data) => {
      setIsSubmitting(false);
      setSubmissions((prev) => [...prev, data.submission]);
    });

    newSocket.on("evaluation-result", (data) => {
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === data.submission.id ? { ...sub, ...data.submission } : sub
        )
      );
      setLastSubmission(data.submission);
      if (data.submission.status === "accepted") {
        console.log("✅ Solution accepted!");
      } else {
        console.log("❌ Solution rejected:", data.submission.testResults);
      }
    });

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
    newSocket.on("error", (errorData) => {
      const errorMessage = errorData?.message || "Unknown socket error";

      console.error("Socket error:", errorMessage);

      setError(errorMessage);
      addNotification(errorMessage, "error");
      setConnectionStatus("error");

      if (errorMessage.includes("Room not found")) {
        setTimeout(() => router.push("/"), 2000);
      }
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

    newSocket.connect();

    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("heartbeat", { timestamp: Date.now() });
      }
    }, 15000);
    timerRef.current = heartbeatInterval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isReady, addNotification]);
  useEffect(() => {
    if (!socket || !room || !user || !userCode || room.status !== "active")
      return;

    setIsSavingCode(true);
    setCodeSaved(false);

    const debounceTimer = setTimeout(() => {
      socket.emit("save-code", {
        roomId: room.id,
        code: userCode,
      });
      console.log(
        `[DEBUG] ✅ Code saved after 2 seconds inactivity at ${new Date().toLocaleTimeString()}`
      );

      setIsSavingCode(false);
      setCodeSaved(true);

      setTimeout(() => {
        setCodeSaved(false);
      }, 2000);
    }, 2000);

    return () => {
      clearTimeout(debounceTimer);
      setIsSavingCode(false);
    };
  }, [userCode]);

  useEffect(() => {
    if (shouldSetTemplate && currentChallenge && currentChallenge.template) {
      const templateCode = currentChallenge.template[selectedLanguage];
      if (templateCode) {
        setUserCode(templateCode);
      }
      setShouldSetTemplate(false);
    }
  }, [selectedLanguage, currentChallenge, shouldSetTemplate]);

  useEffect(() => {
    if (room && user && userCode !== undefined) {
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
      addNotification("Room ID copied to clipboard!", "success");

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
      setIsGenerating(true);
      setAiGenerationError(null); // Clear previous errors
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
    if (!socket || !userCode.trim()) return;

    // ✅ Prevent multiple accepted submissions
    const alreadyAccepted = submissions.some(
      (s) => s.status === "accepted" && s.challengeId === currentChallenge?.id
    );

    if (alreadyAccepted) {
      addNotification("✅ You’ve already solved this challenge!", "info");
      return;
    }

    setIsSubmitting(true);
    socket.emit("submit-solution", {
      roomId: room.id,
      solution: { language: selectedLanguage, code: userCode },
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
  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId);
    setShouldSetTemplate(true);
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
      <NotificationContainer />

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
            onLanguageChange={handleLanguageChange}
            languages={languages}
            userCode={userCode}
            setUserCode={setUserCode}
            isSubmitting={isSubmitting}
            onSubmitSolution={handleSubmitSolution}
            submissions={submissions}
            getStatusColor={getStatusColor}
            lastSubmission={lastSubmission}
            isSavingCode={isSavingCode}
            codeSaved={codeSaved}
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
const DSAChallengeRoomContent = () => {
  return (
    <NotificationProvider>
      <DSAChallengeRoom />
    </NotificationProvider>
  );
};
export default DSAChallengeRoomContent;
