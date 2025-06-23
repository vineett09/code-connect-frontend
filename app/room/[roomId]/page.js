"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import {
  Users,
  MessageCircle,
  Settings,
  Copy,
  Check,
  Send,
  User,
  Code,
  Play,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ChevronDown,
  Palette,
  Download,
  Upload,
} from "lucide-react";

import MonacoEditor from "@/components/MonacoEditor";

export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState(
    "// Welcome to the collaborative code editor!\n// Start typing your code here...\n\nfunction hello() {\n  console.log('Hello, World!');\n}\n\nhello();"
  );
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editor specific states
  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("dark-custom");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const messagesEndRef = useRef(null);

  // Supported languages
  const languages = [
    { id: "javascript", name: "JavaScript", ext: ".js" },
    { id: "typescript", name: "TypeScript", ext: ".ts" },
    { id: "python", name: "Python", ext: ".py" },
    { id: "cpp", name: "C++", ext: ".cpp" },
    { id: "c", name: "C", ext: ".c" },
    { id: "csharp", name: "C#", ext: ".cs" },
    { id: "php", name: "PHP", ext: ".php" },
    { id: "go", name: "Go", ext: ".go" },
    { id: "html", name: "HTML", ext: ".html" },
    { id: "css", name: "CSS", ext: ".css" },
    { id: "scss", name: "SCSS", ext: ".scss" },
    { id: "json", name: "JSON", ext: ".json" },
    { id: "xml", name: "XML", ext: ".xml" },
    { id: "yaml", name: "YAML", ext: ".yml" },
    { id: "markdown", name: "Markdown", ext: ".md" },
    { id: "sql", name: "SQL", ext: ".sql" },
    { id: "bash", name: "Bash", ext: ".sh" },
    { id: "powershell", name: "PowerShell", ext: ".ps1" },
    { id: "dockerfile", name: "Dockerfile", ext: "" },
    { id: "plaintext", name: "Plain Text", ext: ".txt" },
  ];

  const themes = [
    { id: "dark-custom", name: "Dark (Custom)" },
    { id: "light-custom", name: "Light (Custom)" },
    { id: "vs-dark", name: "VS Code Dark" },
    { id: "vs", name: "VS Code Light" },
    { id: "hc-black", name: "High Contrast Dark" },
  ];

  // Initialize socket connection
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      router.push("/");
      return;
    }

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("join-room", { roomId, userName });
    });

    newSocket.on("room-joined", (data) => {
      setRoomData(data.room);
      setCurrentUser(data.user);
      setUsers(data.users);
      if (data.room.code) {
        setCode(data.room.code);
      }
      if (data.room.language) {
        setEditorLanguage(data.room.language);
      }
      setLoading(false);
    });

    newSocket.on("user-joined", (data) => {
      setUsers((prev) => [...prev, data.user]);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "system",
          message: `${data.user.name} joined the room`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("user-left", (data) => {
      setUsers((prev) => prev.filter((user) => user.id !== data.userId));
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "system",
          message: `${data.userName} left the room`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("code-update", (data) => {
      setCode(data.code);
    });

    newSocket.on("language-change", (data) => {
      setEditorLanguage(data.language);
    });

    newSocket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    newSocket.on("error", (data) => {
      setError(data.message);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, router]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (socket) {
      socket.emit("code-change", {
        roomId,
        code: newCode,
        operation: "update",
      });
    }
  };

  const handleLanguageChange = (languageId) => {
    setEditorLanguage(languageId);
    setShowLanguageDropdown(false);

    if (socket) {
      socket.emit("language-change", {
        roomId,
        language: languageId,
      });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !socket) return;

    socket.emit("chat-message", {
      roomId,
      message: chatMessage.trim(),
    });

    setChatMessage("");
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadCode = () => {
    const language = languages.find((lang) => lang.id === editorLanguage);
    const filename = `code${language?.ext || ".txt"}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const leaveRoom = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("userName");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={leaveRoom}
            className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col overflow-x-hidden w-full">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={leaveRoom}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">
                {roomData?.name || "Untitled Room"}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Code className="w-4 h-4" />
                <span className="capitalize">
                  {languages.find((lang) => lang.id === editorLanguage)?.name ||
                    editorLanguage}
                </span>
                <span>•</span>
                <button
                  onClick={copyRoomId}
                  className="flex items-center space-x-1 hover:text-white transition-colors"
                >
                  <span>ID: {roomId}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Code className="w-4 h-4" />
                <span>
                  {languages.find((lang) => lang.id === editorLanguage)?.name ||
                    "Language"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showLanguageDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                        editorLanguage === lang.id
                          ? "bg-slate-600 text-purple-400"
                          : ""
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Palette className="w-4 h-4" />
                <ChevronDown className="w-4 h-4" />
              </button>

              {showThemeDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setEditorTheme(theme.id);
                        setShowThemeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                        editorTheme === theme.id
                          ? "bg-slate-600 text-purple-400"
                          : ""
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Code */}
            <button
              onClick={downloadCode}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Download Code"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowUsers(!showUsers)}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{users.length}</span>
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex w-full overflow-x-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <div className="h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <MonacoEditor
                value={code}
                onChange={handleCodeChange}
                language={editorLanguage}
                theme={editorTheme}
                options={{
                  fontSize: fontSize,
                  minimap: { enabled: true },
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
          {/* Users Panel */}
          {showUsers && (
            <div className="flex-1 border-b border-slate-700">
              <div className="p-4 border-b border-slate-600">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Users ({users.length})</span>
                </h3>
              </div>
              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 bg-slate-700 rounded-lg"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    ></div>
                    <span className="flex-1 text-sm">
                      {user.name}
                      {user.id === currentUser?.id && " (You)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-600">
                <h3 className="font-semibold flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </h3>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-0">
                {messages.map((message) => (
                  <div key={message.id} className="text-sm">
                    {message.type === "system" ? (
                      <div className="text-gray-400 italic text-center">
                        {message.message}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: message.userColor }}
                          ></div>
                          <span className="font-medium text-gray-300">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-100 ml-4">
                          {message.message}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-600"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {showLanguageDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
      {showThemeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeDropdown(false)}
        />
      )}
    </div>
  );
}
