// components/Sidebar.js
import React, { useState } from "react";
import {
  Users,
  Trophy,
  Crown,
  Medal,
  Award,
  Wifi,
  WifiOff,
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const Sidebar = ({ users, user, leaderboard, submissions, getStatusColor }) => {
  const [showSubmissions, setShowSubmissions] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 1:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 2:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-gray-400 font-bold text-xs">
            {index + 1}
          </span>
        );
    }
  };

  const getRankBg = (index) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20";
      case 1:
        return "bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/20";
      case 2:
        return "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-600/20";
      default:
        return "bg-gray-700/50 hover:bg-gray-700";
    }
  };

  const getScoreColor = (index) => {
    switch (index) {
      case 0:
        return "text-yellow-400";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Submissions Panel */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowSubmissions(!showSubmissions)}
          className="w-full bg-gray-700/50 p-4 border-b border-gray-600 flex items-center justify-between hover:bg-gray-700/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Submissions</h3>
            <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full text-sm border border-purple-500/20">
              {submissions.length}
            </span>
          </div>
          {showSubmissions ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {showSubmissions && (
          <div className="p-4 max-h-60 overflow-y-auto scrollbar-hide">
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub, i) => (
                  <div
                    key={sub.id}
                    className={`border rounded-lg p-3 ${getStatusBg(
                      sub.status
                    )} border-opacity-30`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(sub.status)}
                        <span
                          className={`font-medium capitalize text-sm ${getStatusColor(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {sub.score !== undefined && (
                      <div className="text-xs text-gray-300 mb-1">
                        <span className="font-medium">Score:</span> {sub.score}
                      </div>
                    )}
                    {sub.error && (
                      <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded mt-1">
                        {sub.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Users Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 p-4 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Users</h3>
              </div>
              <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-sm border border-blue-500/20">
                {users.length}/5
              </span>
            </div>
          </div>
          <div className="p-4 max-h-40 overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              {users.map((roomUser) => (
                <div
                  key={roomUser.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full border-2 border-gray-600"
                      style={{ backgroundColor: roomUser.color }}
                    />
                    <div className="absolute -top-1 -right-1">
                      {roomUser.disconnected ? (
                        <WifiOff className="w-2 h-2 text-red-400" />
                      ) : (
                        <Wifi className="w-2 h-2 text-green-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium text-sm truncate ${
                          roomUser.disconnected ? "text-gray-500" : "text-white"
                        }`}
                      >
                        {roomUser.name}
                      </span>
                      {roomUser.id === user?.id && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {roomUser.disconnected ? "Offline" : "Online"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Panel */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 p-4 border-b border-gray-600">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
            </div>
          </div>
          <div className="p-4 max-h-40 overflow-y-auto scrollbar-hide">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No scores yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Complete challenges to see rankings
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${getRankBg(
                      index
                    )}`}
                  >
                    <div className="flex-shrink-0">{getRankIcon(index)}</div>
                    <div
                      className="w-3 h-3 rounded-full border-2 border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: entry.userColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate text-sm">
                        {entry.userName}
                      </div>
                    </div>
                    <div
                      className={`font-bold text-sm ${getScoreColor(index)}`}
                    >
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
