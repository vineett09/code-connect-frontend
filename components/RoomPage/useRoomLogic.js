import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import { judge0Languages, languages } from "@/lib/constants";

export const useRoomLogic = () => {
  const { roomId } = useParams();
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState("users");
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("main");
  const [showTabNameModal, setShowTabNameModal] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [tabContents, setTabContents] = useState({});
  const [editorTheme, setEditorTheme] = useState("dark-custom");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [outputPanelHeight, setOutputPanelHeight] = useState(250);

  // Initialize messages from localStorage for persistence on refresh
  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const saved = localStorage.getItem(`chat-history-${roomId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error reading chat history from localStorage", error);
      return [];
    }
  });

  const messagesEndRef = useRef(null);
  const isUpdatingFromServer = useRef(false);

  // Effect to persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`chat-history-${roomId}`, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages to localStorage", e);
    }
  }, [messages, roomId]);

  // Main useEffect for Socket Connection and Event Handling
  useEffect(() => {
    const newSocket = io("http://localhost:5000/main");
    setSocket(newSocket);

    const userName = localStorage.getItem("userName");
    if (!userName) {
      router.push("/");
      return;
    }

    const sessionDataString = localStorage.getItem(`room-session-${roomId}`);
    const sessionData = sessionDataString
      ? JSON.parse(sessionDataString)
      : null;

    newSocket.on("connect", () => {
      console.log("Socket connected, attempting to join room...");
      newSocket.emit("join-room", {
        roomId,
        userName,
        sessionId: sessionData?.sessionId,
      });
    });

    // Event Handlers
    newSocket.on("room-joined", (data) => {
      console.log("Successfully joined room:", data);
      const newSessionData = {
        sessionId: data.sessionId,
        userId: data.user.id,
      };
      localStorage.setItem(
        `room-session-${roomId}`,
        JSON.stringify(newSessionData)
      );

      setRoomData(data.room);
      setCurrentUser(data.user);
      setUsers(data.users);
      setTabs(data.room.tabs);
      setActiveTab(data.room.activeTab);
      const initialContents = {};
      data.room.tabs.forEach((tab) => {
        initialContents[tab.id] = tab.code;
      });
      setTabContents(initialContents);
      setLoading(false);
    });

    newSocket.on("users-list-sync", (data) => {
      console.log("Syncing user list:", data.users);
      setUsers(data.users);
    });

    newSocket.on("user-joined", (data) => {
      console.log("User joined:", data);
      setUsers(data.users);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          message: `${data.user.name} joined the room`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("user-reconnected", (data) => {
      console.log("User reconnected:", data);
      setUsers(data.users);
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          message: `${data.user.name} reconnected`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("user-disconnected", (data) => {
      console.log("User disconnected:", data);
      if (data.users) {
        setUsers(data.users);
      } else {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === data.userId ? { ...user, disconnected: true } : user
          )
        );
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          message: `${data.userName} disconnected`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("user-left", (data) => {
      console.log("User left:", data);
      if (data.users) {
        setUsers(data.users);
      } else {
        setUsers((prev) => prev.filter((user) => user.id !== data.userId));
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          message: `${data.userName} left the room`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("code-update", (data) => {
      if (!data.tabId) return;
      isUpdatingFromServer.current = true;
      setTabContents((prev) => ({ ...prev, [data.tabId]: data.code }));
      setTimeout(() => {
        isUpdatingFromServer.current = false;
      }, 100);
    });

    newSocket.on("tab-created", (data) => {
      setTabs((prev) => {
        if (prev.some((t) => t.id === data.tab.id)) return prev;
        return [...prev, data.tab];
      });
      setTabContents((prev) => ({ ...prev, [data.tab.id]: data.tab.code }));
    });

    newSocket.on("tab-deleted", (data) => {
      const { tabId, newActiveTab } = data;
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
      setTabContents((prev) => {
        const newContents = { ...prev };
        delete newContents[tabId];
        return newContents;
      });
      setActiveTab((currentActiveTab) =>
        currentActiveTab === tabId ? newActiveTab : currentActiveTab
      );
    });
    // In useRoomLogic.js, replace the existing tab-removed handler with:
    // In useRoomLogic.js, replace the tab-removed handler with:
    newSocket.on("tab-removed", (data) => {
      const { tabId } = data;

      setTabs((prevTabs) => {
        const tab = prevTabs.find((t) => t.id === tabId);
        if (tab && tab.createdBy === currentUser?.id) {
          console.log("Ignoring tab-removed for own tab");
          return prevTabs;
        }
        return prevTabs.filter((t) => t.id !== tabId);
      });

      setTabContents((prevContents) => {
        const tab = tabs.find((t) => t.id === tabId);
        if (tab && tab.createdBy === currentUser?.id) {
          return prevContents;
        }
        const newContents = { ...prevContents };
        delete newContents[tabId];
        return newContents;
      });

      setActiveTab((currentActiveTab) => {
        if (currentActiveTab === tabId) {
          return "main";
        }
        return currentActiveTab;
      });
    });

    newSocket.on("tab-privacy-changed", (data) => {
      const { tab, userId, userName } = data;

      setTabs((prev) => {
        const existingTabIndex = prev.findIndex((t) => t.id === tab.id);
        if (existingTabIndex !== -1) {
          const newTabs = [...prev];
          newTabs[existingTabIndex] = {
            ...newTabs[existingTabIndex],
            isPublic: tab.isPublic,
          };
          return newTabs;
        } else if (tab.isPublic) {
          return [...prev, tab];
        }
        return prev;
      });

      if (tab.isPublic && !tabContents[tab.id]) {
        setTabContents((prev) => ({ ...prev, [tab.id]: tab.code }));
      } else if (!tab.isPublic && tab.createdBy === currentUser?.id) {
        setTabContents((prev) => ({ ...prev, [tab.id]: tab.code }));
      }

      const action = tab.isPublic ? "shared" : "made private";
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          type: "system",
          message: `${userName} ${action} the tab "${tab.name}"`,
          timestamp: new Date(),
        },
      ]);
    });

    newSocket.on("user-tab-switched", (data) => {
      console.log("User tab switched:", data);
      if (data.users) {
        setUsers(data.users);
      } else {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === data.userId ? { ...user, activeTab: data.tabId } : user
          )
        );
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Connection failed. Please refresh the page.");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        console.log("Attempting to reconnect...");
        newSocket.connect();
      }
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
      localStorage.removeItem(`room-session-${roomId}`);
    });

    return () => {
      console.log("Disconnecting socket.");
      newSocket.disconnect();
    };
  }, [roomId, router]);

  // Component Functions
  const handleCodeChange = (newCode) => {
    if (isUpdatingFromServer.current) return;
    setTabContents((prev) => ({ ...prev, [activeTab]: newCode }));
    if (socket) {
      socket.emit("code-change", { roomId, tabId: activeTab, code: newCode });
    }
  };

  const handleShareTab = (tabId, isPublic) => {
    if (socket) {
      socket.emit("share-tab", { roomId, tabId, isPublic });
    }
  };

  const leaveRoom = () => {
    if (confirm("Are you sure you want to leave the room?")) {
      if (socket && currentUser) {
        socket.emit("leave-room", { roomId, userId: currentUser.id });
        socket.disconnect();
      }
      localStorage.removeItem(`room-session-${roomId}`);
      localStorage.removeItem(`chat-history-${roomId}`);
      localStorage.removeItem("userName");
      router.push("/");
    }
  };

  const compileAndRun = async () => {
    const currentLang = getCurrentTabLanguage();
    const languageId = judge0Languages[currentLang];
    if (!languageId) {
      setCompilationResult({
        status: "error",
        message: `Compilation not supported for ${currentLang}`,
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
      setCompilationResult({ status: "error", message: error.message });
      setIsCompiling(false);
    }
  };

  const isLanguageSupported = (lang) => judge0Languages.hasOwnProperty(lang);

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

  const handleLanguageChange = (languageId) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab ? { ...tab, language: languageId } : tab
      )
    );
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
    setNewTabName("");
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
      code: `// ${newTabName.trim()}\n// Private tab - only you can see this initially\n// Click the share button to make it visible to others\n`,
      language: "javascript",
      isPublic: false, // Explicitly set as private
      createdBy: currentUser?.id, // Set current user as creator
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

  const getCurrentTabContent = () => tabContents[activeTab] || "";
  const getCurrentTabLanguage = () => {
    const tab = tabs.find((t) => t.id === activeTab);
    return tab?.language || "javascript";
  };

  return {
    // State
    roomId,
    socket,
    roomData,
    currentUser,
    users,
    chatMessage,
    setChatMessage,
    isSidebarOpen,
    setIsSidebarOpen,
    activeSidebarTab,
    setActiveSidebarTab,
    showOutput,
    setShowOutput,
    copied,
    loading,
    error,
    tabs,
    activeTab,
    showTabNameModal,
    setShowTabNameModal,
    newTabName,
    setNewTabName,
    tabContents,
    editorTheme,
    setEditorTheme,
    isCompiling,
    compilationResult,
    customInput,
    setCustomInput,
    outputPanelHeight,
    messages,
    messagesEndRef,

    // Functions
    handleCodeChange,
    handleShareTab,
    leaveRoom,
    compileAndRun,
    isLanguageSupported,
    handleMouseDown,
    handleLanguageChange,
    createNewTab,
    handleCreateTabWithName,
    handleDeleteTab,
    switchTab,
    handleSendMessage,
    copyRoomId,
    downloadCode,
    getCurrentTabContent,
    getCurrentTabLanguage,
  };
};
