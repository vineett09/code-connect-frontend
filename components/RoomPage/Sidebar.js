import {
  Users,
  MessageCircle,
  X,
  Send,
  Download,
  Code,
  Palette,
  ChevronDown,
  Play,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  users,
  currentUser,
  tabs,
  messages,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  messagesEndRef,
  handleLanguageChange,
  getCurrentTabLanguage,
  languages,
  isLanguageSupported,
  editorTheme,
  setEditorTheme,
  themes,
  downloadCode,
}) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  return (
    <aside
      className={`
    flex flex-col bg-slate-800 border border-slate-700 rounded-lg shadow-xl
    transition-all duration-300 ease-in-out overflow-hidden
    lg:w-72 lg:flex-shrink-0
    ${isSidebarOpen ? "w-full sm:w-72" : "w-0"}
    lg:translate-x-0
    ${
      isSidebarOpen && typeof window !== "undefined" && window.innerWidth < 1024
        ? "fixed right-2 top-16 bottom-2 z-40"
        : "lg:static"
    }
  `}
      style={{
        height: "calc(100vh - 4rem)",
      }}
    >
      {/* Header for Tabs and Close Button */}
      <div className="p-2 border-b border-slate-700 flex items-center justify-between bg-slate-800/90 flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveSidebarTab("users")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeSidebarTab === "users"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:bg-slate-700"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveSidebarTab("chat")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeSidebarTab === "chat"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:bg-slate-700"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveSidebarTab("settings")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeSidebarTab === "settings"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:bg-slate-700"
            }`}
          >
            Settings
          </button>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Users Tab */}
        {activeSidebarTab === "users" && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 border-b border-slate-700 flex-shrink-0">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>Participants ({users.length})</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 hover:bg-slate-700/50 transition-colors ${
                    user.disconnected ? "opacity-50" : ""
                  }`}
                  title={
                    user.disconnected
                      ? `${user.name} (disconnected)`
                      : user.name
                  }
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 relative"
                    style={{ backgroundColor: user.color }}
                  >
                    {!user.disconnected && (
                      <span className="absolute inset-0 rounded-full bg-current animate-ping"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className="text-purple-400 ml-1.5 text-xs">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.disconnected
                        ? "Disconnected"
                        : `On tab: ${
                            tabs.find((t) => t.id === user.activeTab)?.name ||
                            "..."
                          }`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab -- ENHANCED UI */}
        {activeSidebarTab === "chat" && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-800">
            <div className="p-3 border-b border-slate-700 flex-shrink-0">
              <h3 className="font-semibold flex items-center gap-2 text-sm text-white">
                <MessageCircle className="w-4 h-4" />
                <span>Room Chat</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === "system" ? (
                    <div className="flex items-center my-3">
                      <div className="flex-grow border-t border-slate-600"></div>
                      <span className="flex-shrink mx-4 text-xs text-slate-400">
                        {message.message}
                      </span>
                      <div className="flex-grow border-t border-slate-600"></div>
                    </div>
                  ) : (
                    <div
                      className={`flex items-end gap-2 ${
                        message.userId === currentUser?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.userId !== currentUser?.id && (
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 bg-slate-600 flex items-center justify-center"
                          style={{ backgroundColor: message.userColor }}
                          title={message.userName}
                        >
                          <span className="text-xs font-bold text-purple-900">
                            {message.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`group max-w-[80%] p-3 rounded-xl shadow-md ${
                          message.userId === currentUser?.id
                            ? "bg-purple-600 text-white rounded-br-none"
                            : "bg-slate-700 text-gray-200 rounded-bl-none"
                        }`}
                      >
                        {message.userId !== currentUser?.id && (
                          <div className="font-semibold text-xs text-purple-300 mb-1">
                            {message.userName}
                          </div>
                        )}
                        <p className="text-sm break-words">{message.message}</p>
                        <div className="text-xs text-right mt-1.5 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-700 flex-shrink-0 bg-slate-800"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed p-2.5 rounded-full transition-colors flex-shrink-0"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {activeSidebarTab === "settings" && (
          <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-4">
            {/* Language Selector */}
            <div className="relative">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">
                Language
              </h4>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full flex items-center justify-between gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>
                    {languages.find(
                      (lang) => lang.id === getCurrentTabLanguage()
                    )?.name || "Language"}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showLanguageDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        handleLanguageChange(lang.id);
                        setShowLanguageDropdown(false);
                      }}
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

            {/* Theme Selector */}
            <div className="relative">
              <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">
                Theme
              </h4>
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="w-full flex items-center justify-between gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>
                    {themes.find((t) => t.id === editorTheme)?.name || "Theme"}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showThemeDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showThemeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50">
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

            {/* Download Button */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider uppercase">
                Actions
              </h4>
              <button
                onClick={downloadCode}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                title="Download Code"
              >
                <Download className="w-4 h-4" />
                <span>Download Current Tab</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
