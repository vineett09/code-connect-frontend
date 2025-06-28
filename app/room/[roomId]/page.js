"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";

import {
  Header,
  Tabs,
  Editor,
  TabNameModal,
  OutputPanel,
  Sidebar,
} from "@/components/RoomPage";
import { judge0Languages, languages, themes } from "@/lib/constants";

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
  const [lastSavedContents, setLastSavedContents] = useState({});
  const [editorLanguage, setEditorLanguage] = useState("javascript");
  const [editorTheme, setEditorTheme] = useState("dark-custom");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [outputPanelHeight, setOutputPanelHeight] = useState(250);

  const messagesEndRef = useRef(null);
  const isUpdatingFromServer = useRef(false);

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
      <Header
        roomData={roomData}
        roomId={roomId}
        leaveRoom={leaveRoom}
        copyRoomId={copyRoomId}
        copied={copied}
        compileAndRun={compileAndRun}
        isCompiling={isCompiling}
        isLanguageSupported={isLanguageSupported}
        getCurrentTabLanguage={getCurrentTabLanguage}
        languages={languages}
        downloadCode={downloadCode}
        showOutput={showOutput}
        setShowOutput={setShowOutput}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
        <div className="flex-1 flex gap-2 overflow-hidden">
          {/* Main content: Editor and Tabs */}
          <main className="flex-1 flex flex-col min-w-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              switchTab={switchTab}
              createNewTab={createNewTab}
              handleDeleteTab={handleDeleteTab}
            />
            <Editor
              activeTab={activeTab}
              getCurrentTabContent={getCurrentTabContent}
              handleCodeChange={handleCodeChange}
              getCurrentTabLanguage={getCurrentTabLanguage}
              editorTheme={editorTheme}
              fontSize={fontSize}
              showOutput={showOutput}
              outputPanelHeight={outputPanelHeight}
            />
          </main>

          {/* Sidebar */}
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activeSidebarTab={activeSidebarTab}
            setActiveSidebarTab={setActiveSidebarTab}
            users={users}
            currentUser={currentUser}
            tabs={tabs}
            messages={messages}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            handleSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
            // Add these new props for the settings tab
            handleLanguageChange={handleLanguageChange}
            getCurrentTabLanguage={getCurrentTabLanguage}
            languages={languages}
            isLanguageSupported={isLanguageSupported}
            editorTheme={editorTheme}
            setEditorTheme={setEditorTheme}
            themes={themes}
            downloadCode={downloadCode}
          />
        </div>

        {/* Output Panel */}
        {showOutput && (
          <OutputPanel
            showOutput={showOutput}
            setShowOutput={setShowOutput}
            outputPanelHeight={outputPanelHeight}
            handleMouseDown={handleMouseDown}
            isCompiling={isCompiling}
            compilationResult={compilationResult}
            getStatusIcon={getStatusIcon}
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
        )}
      </div>

      <TabNameModal
        showTabNameModal={showTabNameModal}
        setShowTabNameModal={setShowTabNameModal}
        newTabName={newTabName}
        setNewTabName={setNewTabName}
        handleCreateTabWithName={handleCreateTabWithName}
      />

      {/* Overlays for modals and mobile sidebar */}
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
