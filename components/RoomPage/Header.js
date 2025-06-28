import {
  ArrowLeft,
  Code,
  Copy,
  Check,
  Play,
  Loader2,
  Download,
  Terminal,
  Menu,
} from "lucide-react";

export default function Header({
  roomData,
  roomId,
  leaveRoom,
  copyRoomId,
  copied,
  compileAndRun,
  isCompiling,
  isLanguageSupported,
  getCurrentTabLanguage,
  languages,
  downloadCode,
  showOutput,
  setShowOutput,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
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
            <div className="flex items-center gap-2 text-xs text-gray-400">
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
          <button
            onClick={downloadCode}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 hidden md:flex"
            title="Download Code"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-slate-700 lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
