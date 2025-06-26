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
  X,
  Play,
  Terminal,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Menu,
  Settings,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState("users"); // 'users', 'chat', or 'settings'
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("main");
  const [showTabNameModal, setShowTabNameModal] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [tabContents, setTabContents] = useState({});
  const [lastSavedContents, setLastSavedContents] = useState({});

  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("dark-custom");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  // Judge0 Integration States
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [outputPanelHeight, setOutputPanelHeight] = useState(250);

  const messagesEndRef = useRef(null);
  const isUpdatingFromServer = useRef(false);
  const editorRef = useRef(null);
  const resizeRef = useRef(null);
  // Judge0 Language ID mapping
  const judge0Languages = {
    javascript: 63, // Node.js
    python: 71, // Python 3
    cpp: 54, // C++ (GCC 9.2.0)
    c: 50, // C (GCC 9.2.0)
    csharp: 51, // C# (Mono 6.6.0.161)
    php: 68, // PHP (7.4.1)
    go: 60, // Go (1.13.5)
    java: 62, // Java (OpenJDK 13.0.1)
    sql: 82, // SQL (SQLite 3.27.2)
    bash: 46, // Bash (5.0.0)
    plaintext: 43, // Plain Text
  };

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

  const themes = [
    { id: "dark-custom", name: "Dark (Custom)" },
    { id: "light-custom", name: "Light (Custom)" },
    { id: "vs-dark", name: "VS Code Dark" },
    { id: "vs", name: "VS Code Light" },
    { id: "hc-black", name: "High Contrast Dark" },
  ];

  // Judge0 API Functions
  const compileAndRun = async () => {
    const currentLang = getCurrentTabLanguage();
    const languageId = judge0Languages[currentLang];

    if (!languageId) {
      setCompilationResult({
        status: "error",
        message: `Compilation not supported for ${currentLang}`,
        output: null,
        stderr: null,
        compile_output: null,
      });
      setShowOutput(true);
      return;
    }

    setIsCompiling(true);
    setShowOutput(true);
    setCompilationResult(null);

    try {
      const code = getCurrentTabContent();

      const submitResponse = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key":
              process.env.NEXT_PUBLIC_JUDGE0_API_KEY ||
              "YOUR_RAPIDAPI_KEY_HERE",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: customInput || null,
          }),
        }
      );

      if (!submitResponse.ok) {
        throw new Error(`HTTP error! status: ${submitResponse.status}`);
      }

      const submitResult = await submitResponse.json();
      const submissionId = submitResult.token;

      const pollResult = async () => {
        const resultResponse = await fetch(
          `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`,
          {
            headers: {
              "X-RapidAPI-Key":
                process.env.NEXT_PUBLIC_JUDGE0_API_KEY ||
                "YOUR_RAPIDAPI_KEY_HERE",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        if (!resultResponse.ok) {
          throw new Error(`HTTP error! status: ${resultResponse.status}`);
        }

        const result = await resultResponse.json();

        if (result.status.id <= 2) {
          setTimeout(pollResult, 1000);
          return;
        }

        setCompilationResult({
          status: result.status.description,
          statusId: result.status.id,
          output: result.stdout,
          stderr: result.stderr,
          compile_output: result.compile_output,
          time: result.time,
          memory: result.memory,
        });
        setIsCompiling(false);
      };

      pollResult();
    } catch (error) {
      console.error("Compilation error:", error);
      setCompilationResult({
        status: "error",
        message: error.message,
        output: null,
        stderr: null,
        compile_output: null,
      });
      setIsCompiling(false);
    }
  };

  const getStatusIcon = (statusId) => {
    if (statusId === 3)
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (statusId >= 4 && statusId <= 12)
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (statusId === 5) return <Clock className="w-5 h-5 text-yellow-400" />;
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  const isLanguageSupported = (lang) => {
    return judge0Languages.hasOwnProperty(lang);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = outputPanelHeight;

    const handleMouseMove = (e) => {
      const newHeight = startHeight - (e.clientY - startY);
      setOutputPanelHeight(
        Math.max(100, Math.min(window.innerHeight * 0.7, newHeight))
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const tab = tabs.find((t) => t.id === activeTab);
    if (tab?.language) {
      setEditorLanguage(tab.language);
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    const userName = localStorage.getItem("userName");
    if (!userName) return router.push("/");

    newSocket.on("connect", () => {
      newSocket.emit("join-room", { roomId, userName });
    });

    newSocket.on("room-joined", (data) => {
      setRoomData(data.room);
      setCurrentUser(data.user);
      setUsers(data.users);
      setTabs(data.room.tabs);
      setActiveTab(data.room.activeTab);

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

    newSocket.on("tab-created", (data) => {
      setTabs((prev) => {
        const exists = prev.some((t) => t.id === data.tab.id);
        if (exists) return prev;
        return [...prev, data.tab];
      });
      setTabContents((prev) => ({ ...prev, [data.tab.id]: data.tab.code }));
      setLastSavedContents((prev) => ({
        ...prev,
        [data.tab.id]: data.tab.code,
      }));
    });

    newSocket.on("tab-deleted", (data) => {
      const { tabId, newActiveTab } = data;
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
      setTabContents((prev) => {
        const newContents = { ...prev };
        delete newContents[tabId];
        return newContents;
      });
      setLastSavedContents((prev) => {
        const newSaved = { ...prev };
        delete newSaved[tabId];
        return newSaved;
      });
      setActiveTab((currentActiveTab) => {
        if (currentActiveTab === tabId) {
          return newActiveTab;
        }
        return currentActiveTab;
      });
    });

    newSocket.on("code-update", (data) => {
      if (!data.tabId) return;
      isUpdatingFromServer.current = true;
      setTabContents((prev) => ({ ...prev, [data.tabId]: data.code }));
      setLastSavedContents((prev) => ({ ...prev, [data.tabId]: data.code }));
      setTimeout(() => {
        isUpdatingFromServer.current = false;
      }, 100);
    });

    newSocket.on("tab-switched-response", (data) => {
      if (!data.tabId) return;
      isUpdatingFromServer.current = true;
      setTabContents((prev) => ({ ...prev, [data.tabId]: data.code }));
      setLastSavedContents((prev) => ({ ...prev, [data.tabId]: data.code }));
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCodeChange = (newCode) => {
    if (isUpdatingFromServer.current) return;
    setTabContents((prev) => ({ ...prev, [activeTab]: newCode }));
    if (socket) {
      socket.emit("code-change", { roomId, tabId: activeTab, code: newCode });
    }
  };

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
    setShowTabNameModal(true);
    setNewTabName(""); // Reset input
  };
  const handleCreateTabWithName = () => {
    if (!newTabName.trim()) {
      alert("Please enter a tab name");
      return;
    }

    const newTabId = `tab-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newTab = {
      id: newTabId,
      name: newTabName.trim(),
      code: `// ${newTabName.trim()}\n// Start coding here...\n`,
      language: "javascript",
    };

    if (socket) {
      socket.emit("create-tab", { roomId, tab: newTab });
    }

    setShowTabNameModal(false);
    setNewTabName("");
  };

  const handleDeleteTab = (tabIdToDelete) => {
    if (socket && tabIdToDelete !== "main") {
      socket.emit("delete-tab", { roomId, tabId: tabIdToDelete });
    }
  };

  const switchTab = (tabId) => {
    if (tabId === activeTab) return;
    const currentContent = tabContents[activeTab];
    if (currentContent !== lastSavedContents[activeTab]) {
      if (socket) {
        socket.emit("code-change", {
          roomId,
          tabId: activeTab,
          code: currentContent,
        });
      }
    }
    setActiveTab(tabId);
    if (socket) {
      socket.emit("switch-tab", { roomId, tabId });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !socket) return;
    socket.emit("chat-message", { roomId, message: chatMessage.trim() });
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

  const getCurrentTabContent = () => tabContents[activeTab] || "";
  const getCurrentTabLanguage = () => {
    const tab = tabs.find((t) => t.id === activeTab);
    return tab?.language || "javascript";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400 text-lg">Joining room...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center bg-slate-800 p-8 rounded-lg shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white">Error</h2>
          <p className="text-gray-400 mb-6 max-w-sm">{error}</p>
          <button
            onClick={leaveRoom}
            className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-2 sm:px-4 py-2 sm:py-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={leaveRoom}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 shrink-0"
              title="Leave Room"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold truncate">
                {roomData?.name || "Untitled Room"}
              </h1>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="capitalize truncate">
                  {languages.find((lang) => lang.id === getCurrentTabLanguage())
                    ?.name || getCurrentTabLanguage()}
                </span>
                <span className="text-gray-600">•</span>
                <button
                  onClick={copyRoomId}
                  className="flex items-center gap-1.5 hover:text-white transition-colors truncate"
                >
                  <span className="truncate max-w-20 sm:max-w-none">
                    {roomId}
                  </span>
                  {copied ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  )}
                </button>
              </div>
              <div className="sm:hidden flex items-center gap-2 text-xs text-gray-400">
                <button
                  onClick={copyRoomId}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span className="truncate max-w-16">{roomId}</span>
                  {copied ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={compileAndRun}
              disabled={
                isCompiling || !isLanguageSupported(getCurrentTabLanguage())
              }
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-semibold ${
                isLanguageSupported(getCurrentTabLanguage())
                  ? "bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-wait"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              title={
                !isLanguageSupported(getCurrentTabLanguage())
                  ? "Language not supported for compilation"
                  : "Compile and Run Code"
              }
            >
              {isCompiling ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden xs:inline">Run</span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 lg:hidden"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Code className="w-4 h-4" />
                  <span className="hidden lg:inline">
                    {languages.find(
                      (lang) => lang.id === getCurrentTabLanguage()
                    )?.name || "Language"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-600 transition-colors flex items-center justify-between ${
                          getCurrentTabLanguage() === lang.id
                            ? "bg-slate-600 text-purple-400 font-semibold"
                            : ""
                        }`}
                      >
                        <span>{lang.name}</span>
                        {isLanguageSupported(lang.id) && (
                          <Play className="w-3 h-3 text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm"
                  title="Change Theme"
                >
                  <Palette className="w-4 h-4" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showThemeDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setEditorTheme(theme.id);
                          setShowThemeDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-600 transition-colors ${
                          editorTheme === theme.id
                            ? "bg-slate-600 text-purple-400 font-semibold"
                            : ""
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={downloadCode}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700"
                title="Download Code"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowOutput(!showOutput)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                showOutput
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Output</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tabs */}
          <div className="shrink-0 bg-slate-800 border-b border-slate-700 px-1 sm:px-2 md:px-4">
            <div className="flex items-center min-h-0">
              <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto py-1.5 sm:py-2 flex-1 min-w-0 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`flex items-center group py-1.5 sm:py-2.5 text-xs sm:text-sm rounded-md whitespace-nowrap transition-all duration-200 shrink-0 ${
                      activeTab === tab.id
                        ? "bg-slate-700 text-white font-semibold pl-2 sm:pl-4 pr-1 sm:pr-2"
                        : "bg-transparent text-gray-300 hover:bg-slate-700/50 hover:text-white px-2 sm:px-4"
                    }`}
                  >
                    <span className="truncate max-w-20 sm:max-w-none">
                      {tab.name}
                    </span>
                    {tab.id !== "main" && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTab(tab.id);
                        }}
                        className="ml-1 sm:ml-2 p-0.5 sm:p-1 rounded-full text-gray-400 opacity-50 group-hover:opacity-100 hover:!opacity-100 hover:bg-red-500 hover:text-white transition-all shrink-0"
                        title="Delete Tab"
                      >
                        <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={createNewTab}
                className="ml-1 sm:ml-2 p-1 sm:p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors shrink-0"
                title="Create New Tab"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-1 sm:p-2 md:p-4 overflow-hidden">
            <div className="flex-1 h-[calc(100vh-10rem)] bg-slate-800 rounded-lg border border-slate-700 overflow-hidden relative">
              <MonacoEditor
                key={activeTab}
                value={getCurrentTabContent()}
                onChange={handleCodeChange}
                language={getCurrentTabLanguage()}
                theme={editorTheme}
                options={{
                  fontSize: window.innerWidth < 640 ? 12 : fontSize,
                  minimap: { enabled: window.innerWidth >= 768 },
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  roundedSelection: false,
                  lineNumbers: window.innerWidth < 640 ? "off" : "on",
                  folding: window.innerWidth >= 768,
                  overviewRulerLanes: window.innerWidth >= 768 ? 3 : 0,
                }}
              />
            </div>

            {showTabNameModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 w-96 max-w-[90vw]">
                  <h3 className="text-lg font-semibold mb-4 text-white">
                    Create New Tab
                  </h3>
                  <input
                    type="text"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    placeholder="Enter tab name..."
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all mb-4"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateTabWithName();
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowTabNameModal(false);
                        setNewTabName("");
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateTabWithName}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                    >
                      Create Tab
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Output Panel */}
          {/* Output Panel responsive fixes */}
          {showOutput && (
            <div className="shrink-0 border-t-2 border-slate-700">
              <div
                ref={resizeRef}
                onMouseDown={handleMouseDown}
                className="h-1 sm:h-2 bg-slate-700 hover:bg-slate-600 cursor-row-resize flex items-center justify-center transition-colors"
              >
                <div className="w-8 sm:w-10 h-0.5 sm:h-1 bg-slate-500 rounded-full"></div>
              </div>

              <div
                style={{
                  height:
                    window.innerWidth < 768
                      ? Math.min(outputPanelHeight, 200)
                      : outputPanelHeight,
                }}
                className="bg-slate-800 flex flex-col lg:flex-row"
              >
                {/* Output Display */}
                <div className="flex-1 flex flex-col h-full lg:w-2/3">
                  <div className="p-2 sm:p-3 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-300">
                      Output
                    </h3>
                    <button
                      onClick={() => setShowOutput(false)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Close Output Panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 p-2 sm:p-4 overflow-auto">
                    {/* Output content remains the same but with responsive text sizes */}
                    {isCompiling ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-400" />
                          <span className="text-sm sm:text-base text-gray-300">
                            Compiling and running...
                          </span>
                        </div>
                      </div>
                    ) : compilationResult ? (
                      <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(compilationResult.statusId)}
                          <span
                            className={`font-semibold ${
                              compilationResult.statusId === 3
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {compilationResult.status}
                          </span>
                          {compilationResult.time !== null && (
                            <span className="text-xs text-gray-500">
                              (time: {compilationResult.time}s, memory:{" "}
                              {compilationResult.memory}KB)
                            </span>
                          )}
                        </div>
                        {compilationResult.output && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                              STDOUT
                            </h4>
                            <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-green-300 whitespace-pre-wrap break-all">
                              {compilationResult.output}
                            </pre>
                          </div>
                        )}
                        {compilationResult.stderr && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                              STDERR
                            </h4>
                            <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-red-400 whitespace-pre-wrap break-all">
                              {compilationResult.stderr}
                            </pre>
                          </div>
                        )}
                        {compilationResult.compile_output && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                              COMPILE OUTPUT
                            </h4>
                            <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-yellow-400 whitespace-pre-wrap break-all">
                              {compilationResult.compile_output}
                            </pre>
                          </div>
                        )}
                        {compilationResult.message && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                              ERROR
                            </h4>
                            <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-red-400 whitespace-pre-wrap break-all">
                              {compilationResult.message}
                            </pre>
                          </div>
                        )}
                        {!compilationResult.output &&
                          !compilationResult.stderr &&
                          !compilationResult.compile_output &&
                          !compilationResult.message &&
                          compilationResult.statusId === 3 && (
                            <div className="flex flex-col items-center justify-center text-center py-8">
                              <Terminal className="w-10 h-10 text-gray-600 mb-2" />
                              <p className="text-gray-500">
                                Execution successful, but no output was
                                generated.
                              </p>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <Terminal className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 mb-2" />
                        <p className="text-gray-500 text-sm sm:text-base">
                          Click "Run" to see the output here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Custom Input Panel */}
                <div className="h-40 lg:h-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col">
                  <div className="p-2 sm:p-3 border-b border-slate-700">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-300">
                      Custom Input (stdin)
                    </h3>
                  </div>
                  <div className="flex-1 p-1 sm:p-2">
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter input for your program..."
                      className="w-full h-full bg-slate-900 text-white text-xs sm:text-sm font-mono p-2 sm:p-3 rounded-md border border-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside
          className={`flex flex-col bg-slate-800 border-l border-slate-700 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-full sm:w-80" : "w-0"}
          lg:w-80 fixed lg:static right-0 top-0 h-full lg:h-auto z-40 lg:z-auto
          ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } lg:translate-x-0
          lg:flex-shrink-0`}
        >
          <div className="p-2 border-b border-slate-700 flex items-center justify-between">
            <div className="flex bg-slate-700 p-1 rounded-md">
              <button
                onClick={() => setActiveSidebarTab("users")}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded ${
                  activeSidebarTab === "users"
                    ? "bg-slate-600 text-white"
                    : "text-gray-400 hover:bg-slate-600/50"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveSidebarTab("chat")}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded ${
                  activeSidebarTab === "chat"
                    ? "bg-slate-600 text-white"
                    : "text-gray-400 hover:bg-slate-600/50"
                }`}
              >
                Chat
              </button>
              {/* Show settings tab button only on small screens */}
              <button
                onClick={() => setActiveSidebarTab("settings")}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded lg:hidden ${
                  activeSidebarTab === "settings"
                    ? "bg-slate-600 text-white"
                    : "text-gray-400 hover:bg-slate-600/50"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 lg:hidden"
              title="Close Sidebar"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {activeSidebarTab === "users" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Participants ({users.length})</span>
                </h3>
              </div>
              <div className="flex-1 p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 bg-slate-700/50 rounded-lg"
                  >
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                      style={{ backgroundColor: user.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-200 truncate">
                        {user.name}
                        {user.id === currentUser?.id && (
                          <span className="text-purple-400"> (You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        On Tab:{" "}
                        {tabs.find((t) => t.id === user.activeTab)?.name ||
                          "..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSidebarTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Room Chat</span>
                </h3>
              </div>
              <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto min-h-0">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.type === "system" ? (
                      <div className="text-xs text-gray-400 italic text-center my-2">
                        {message.message}
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-1.5"
                          style={{ backgroundColor: message.userColor }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-gray-300 text-xs sm:text-sm truncate">
                              {message.userName}
                            </span>
                            <span className="text-xs text-gray-500 shrink-0">
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                          <p className="text-gray-200 break-words text-xs sm:text-sm">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-slate-700"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 sm:p-2.5 rounded-lg transition-colors"
                  >
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSidebarTab === "settings" && (
            <div className="flex-1 flex flex-col overflow-hidden lg:hidden">
              <div className="p-3 sm:p-4 border-b border-slate-700">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Editor Settings</span>
                </h3>
              </div>
              <div className="flex-1 p-3 sm:p-4 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Language</label>
                  <div className="relative">
                    <select
                      value={getCurrentTabLanguage()}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-400">Theme</label>
                  <div className="relative">
                    <select
                      value={editorTheme}
                      onChange={(e) => setEditorTheme(e.target.value)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      {themes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={downloadCode}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
      {/* Overlay for dropdowns and mobile sidebar */}
      {(showLanguageDropdown ||
        showThemeDropdown ||
        showTabNameModal ||
        (isSidebarOpen &&
          typeof window !== "undefined" &&
          window.innerWidth < 1024)) && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:bg-transparent"
          onClick={() => {
            setShowLanguageDropdown(false);
            setShowThemeDropdown(false);
            setShowTabNameModal(false);
            if (typeof window !== "undefined" && window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
        />
      )}
    </div>
  );
}
