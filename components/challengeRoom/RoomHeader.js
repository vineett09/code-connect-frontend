// components/RoomHeader.js
import React from "react";
import { Users, Clock, LogOut, Copy, Check, Settings } from "lucide-react";

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

  const formatTopicName = (topic) => {
    return topic.charAt(0).toUpperCase() + topic.slice(1).replace("-", " ");
  };

  return (
    <div className="bg-gray-800 shadow-lg border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white truncate max-w-xs">
                {room.name}
              </h1>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(
                  room.difficulty
                )}`}
              >
                {room.difficulty.toUpperCase()}
              </span>
            </div>

            {remainingTime > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="font-mono text-red-400 font-medium text-sm">
                  {formatTime(remainingTime)}
                </span>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Topic Selector - Only for room creator */}
            {user?.name === room?.createdBy && (
              <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
                <Settings className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedTopic}
                  onChange={onTopicChange}
                  className="bg-transparent text-gray-300 focus:outline-none text-sm min-w-0"
                >
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic} className="bg-gray-700">
                      {formatTopicName(topic)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Users Count */}
            <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">
                {users.length}/5
              </span>
            </div>

            {/* Copy Room ID */}
            <button
              onClick={onCopyRoomId}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 rounded-lg transition-colors text-gray-300"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy ID</span>
                </>
              )}
            </button>

            {/* Leave Room */}
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomHeader;
