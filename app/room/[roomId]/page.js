"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import {
  Users,
  MessageCircle,
  Plus,
  Copy,
  Check,
  Send,
  Code,
  ArrowLeft,
  ChevronDown,
  Palette,
  Download,
} from "lucide-react";

import MonacoEditor from "@/components/MonacoEditor";

export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [showChat, setShowChat] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("main");

  // FIXED: Better tab content management
  const [tabContents, setTabContents] = useState({}); // Local editor content for each tab
  const [lastSavedContents, setLastSavedContents] = useState({}); // Last known server content

  // Editor specific states
  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("dark-custom");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  const messagesEndRef = useRef(null);
  const isUpdatingFromServer = useRef(false);
  const editorRef = useRef(null);

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

  // FIXED: Update editor language when active tab changes
  useEffect(() => {
    const tab = tabs.find((t) => t.id === activeTab);
    if (tab?.language) {
      setEditorLanguage(tab.language);
    }
  }, [activeTab, tabs]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    const userName = localStorage.getItem("userName");
    if (!userName) return router.push("/");

    newSocket.on("connect", () => {
      newSocket.emit("join-room", { roomId, userName });
    });

    // FIXED: Proper initialization of tab contents
    newSocket.on("room-joined", (data) => {
      setRoomData(data.room);
      setCurrentUser(data.user);
      setUsers(data.users);
      setTabs(data.room.tabs);
      setActiveTab(data.room.activeTab);

      // Initialize tab contents properly
      const initialContents = {};
      const initialSavedContents = {};

      data.room.tabs.forEach((tab) => {
        initialContents[tab.id] = tab.code;
        initialSavedContents[tab.id] = tab.code;
      });

      setTabContents(initialContents);
      setLastSavedContents(initialSavedContents);
      setLoading(false);
    });

    // FIXED: Handle tab creation properly
    newSocket.on("tab-created", (data) => {
      setTabs((prev) => {
        const exists = prev.some((t) => t.id === data.tab.id);
        if (exists) return prev;
        return [...prev, data.tab];
      });

      // Initialize content for new tab
      setTabContents((prev) => ({
        ...prev,
        [data.tab.id]: data.tab.code,
      }));

      setLastSavedContents((prev) => ({
        ...prev,
        [data.tab.id]: data.tab.code,
      }));
    });

    // FIXED: Handle code updates more carefully
    newSocket.on("code-update", (data) => {
      if (!data.tabId) return;

      isUpdatingFromServer.current = true;

      // Update both local and saved content for the specific tab
      setTabContents((prev) => ({
        ...prev,
        [data.tabId]: data.code,
      }));

      setLastSavedContents((prev) => ({
        ...prev,
        [data.tabId]: data.code,
      }));

      setTimeout(() => {
        isUpdatingFromServer.current = false;
      }, 100);
    });

    // FIXED: Handle tab switching better
    newSocket.on("tab-switched-response", (data) => {
      if (!data.tabId) return;

      isUpdatingFromServer.current = true;

      // Update content for the specific tab
      setTabContents((prev) => ({
        ...prev,
        [data.tabId]: data.code,
      }));

      setLastSavedContents((prev) => ({
        ...prev,
        [data.tabId]: data.code,
      }));

      // Update tab language if provided
      if (data.language) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === data.tabId ? { ...tab, language: data.language } : tab
          )
        );
      }

      setTimeout(() => {
        isUpdatingFromServer.current = false;
      }, 100);
    });

    // Handle user tab switches (for UI indication only)
    newSocket.on("user-tab-switched", (data) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === data.userId ? { ...user, activeTab: data.tabId } : user
        )
      );
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

    // FIXED: Handle language changes for specific tabs
    newSocket.on("language-changed", (data) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === data.tabId ? { ...tab, language: data.language } : tab
        )
      );
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

  // FIXED: Handle code changes with proper debouncing
  const handleCodeChange = (newCode) => {
    if (isUpdatingFromServer.current) return;

    // Update local tab content immediately
    setTabContents((prev) => ({
      ...prev,
      [activeTab]: newCode,
    }));

    // Debounce server updates
    if (socket) {
      socket.emit("code-change", {
        roomId,
        tabId: activeTab,
        code: newCode,
      });
    }
  };

  // FIXED: Handle language changes for specific tabs
  const handleLanguageChange = (languageId) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab ? { ...tab, language: languageId } : tab
      )
    );
    setShowLanguageDropdown(false);

    if (socket) {
      socket.emit("language-change", {
        roomId,
        language: languageId,
        tabId: activeTab,
      });
    }
  };

  const createNewTab = () => {
    const newTabId = `tab-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newTab = {
      id: newTabId,
      name: `Tab ${tabs.length + 1}`,
      code: `// New tab created\n// Start coding here...\n`,
      language: "javascript",
    };

    if (socket) {
      socket.emit("create-tab", {
        roomId,
        tab: newTab,
      });
    }
  };

  // FIXED: Handle tab switching with proper content management
  const switchTab = (tabId) => {
    if (tabId === activeTab) return;

    // Save current tab content before switching
    const currentContent = tabContents[activeTab];
    if (currentContent !== lastSavedContents[activeTab]) {
      // Sync current content to server before switching
      if (socket) {
        socket.emit("code-change", {
          roomId,
          tabId: activeTab,
          code: currentContent,
        });
      }
    }

    // Switch to new tab
    setActiveTab(tabId);

    // Request current content for the new tab
    if (socket) {
      socket.emit("switch-tab", { roomId, tabId });
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
    const currentTab = tabs.find((tab) => tab.id === activeTab);
    const language = languages.find((lang) => lang.id === currentTab?.language);
    const filename = `${currentTab?.name || "code"}${language?.ext || ".txt"}`;
    const blob = new Blob([tabContents[activeTab] || ""], {
      type: "text/plain",
    });
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

  // Get current tab content safely
  const getCurrentTabContent = () => {
    return tabContents[activeTab] || "";
  };

  // Get current tab language safely
  const getCurrentTabLanguage = () => {
    const tab = tabs.find((t) => t.id === activeTab);
    return tab?.language || "javascript";
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
                  {languages.find((lang) => lang.id === getCurrentTabLanguage())
                    ?.name || getCurrentTabLanguage()}
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
                  {languages.find((lang) => lang.id === getCurrentTabLanguage())
                    ?.name || "Language"}
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
                        getCurrentTabLanguage() === lang.id
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
      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        {/* Tab Bar */}
        <div className="bg-slate-700 border-b border-slate-600 px-6 py-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`px-4 py-2 text-sm rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-slate-800 text-white border-b-2 border-purple-500"
                      : "bg-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 text-xs text-gray-400">
                    {languages.find((lang) => lang.id === tab.language)?.name ||
                      tab.language}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={createNewTab}
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
              title="Create New Tab"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <div className="h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <MonacoEditor
                  key={activeTab} // Force re-render when tab changes
                  value={getCurrentTabContent()}
                  onChange={handleCodeChange}
                  language={getCurrentTabLanguage()}
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
                      <div className="flex-1">
                        <span className="text-sm">
                          {user.name}
                          {user.id === currentUser?.id && " (You)"}
                        </span>
                        {user.activeTab && (
                          <div className="text-xs text-gray-400">
                            Tab:{" "}
                            {tabs.find((t) => t.id === user.activeTab)?.name ||
                              user.activeTab}
                          </div>
                        )}
                      </div>
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
