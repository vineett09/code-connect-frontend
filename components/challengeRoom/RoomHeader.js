import React, { useState } from "react";
import {
  Users,
  Clock,
  LogOut,
  Copy,
  Check,
  Settings,
  Menu,
  X,
} from "lucide-react";

const topicOptions = [
  "any",
  "arrays",
  "linked-list",
  "trees",
  "graphs",
  "dp",
  "strings",
  "sorting",
  "greedy",
  "backtracking",
  "bit-manipulation",
  "math",
  "binary-search",
  "two-pointers",
  "sliding-window",
  "stack",
  "queue",
  "heap",
  "binary-search-tree",
  "segment-tree",
  "hash-table",
  "trie",
  "graph-theory",
];

const RoomHeader = ({
  room,
  user,
  users,
  remainingTime,
  copied,
  onCopyRoomId,
  onLeaveRoom,
  selectedTopic,
  onTopicChange,
  formatTime,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const formatTopicName = (topic) =>
    topic.charAt(0).toUpperCase() + topic.slice(1).replace("-", " ");

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Top bar: name, diff, timer, users + hamburger */}
        <div className="flex items-center justify-between h-14">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
              {room.name}
            </h1>
            <span
              className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${getDifficultyColor(
                room.difficulty
              )}`}
            >
              {room.difficulty.toUpperCase()}
            </span>

            {/* Timer (visible on all sizes) */}
            {remainingTime > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <Clock className="w-4 h-4 text-red-400 shrink-0" />
                <span className="font-mono text-red-400 text-sm">
                  {formatTime(remainingTime)}
                </span>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Users count (always visible) */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-700/50 border border-gray-600">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm font-medium text-gray-300">
                {users.length}/5
              </span>
            </div>

            {/* Hamburger only on xs */}
            <button
              className="sm:hidden p-1 text-gray-300 hover:text-white"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop controls (hidden on xs) */}
            <nav className="hidden sm:flex items-center gap-3">
              {user?.name === room?.createdBy && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-700/50 border border-gray-600">
                  <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={selectedTopic}
                    onChange={onTopicChange}
                    className="bg-transparent text-gray-300 text-sm focus:outline-none"
                  >
                    {topicOptions.map((topic) => (
                      <option key={topic} value={topic} className="bg-gray-700">
                        {formatTopicName(topic)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={onCopyRoomId}
                className="flex items-center gap-1.5 px-2.5 py-1 text-sm bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg transition-colors text-gray-300"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400 shrink-0" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 shrink-0" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>

              <button
                onClick={onLeaveRoom}
                className="flex items-center gap-1.5 px-2.5 py-1 text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Leave</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile drawer menu (only < sm) */}
        {menuOpen && (
          <nav className="sm:hidden flex flex-col gap-3 pb-4">
            {user?.name === room?.createdBy && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600">
                <Settings className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    onTopicChange(e);
                    setMenuOpen(false);
                  }}
                  className="bg-transparent text-gray-300 text-sm focus:outline-none w-full"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic} className="bg-gray-700">
                      {formatTopicName(topic)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                onCopyRoomId();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg transition-colors text-gray-300"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>Copy Room ID</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onLeaveRoom();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Leave Room</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default RoomHeader;
