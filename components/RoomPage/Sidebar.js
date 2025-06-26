import {
  Users,
  MessageCircle,
  Settings,
  X,
  Send,
  Download,
} from "lucide-react";

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
  editorTheme,
  setEditorTheme,
  themes,
  downloadCode,
}) {
  return (
    <aside
      className={`flex flex-col bg-slate-800 border-l border-slate-700 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-full sm:w-80" : "w-0"}
        lg:w-80 fixed lg:static right-0 top-0 h-full lg:h-auto z-40 lg:z-auto
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0
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
                    {tabs.find((t) => t.id === user.activeTab)?.name || "..."}
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
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
  );
}
