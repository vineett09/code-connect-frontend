// components/MainContent.js
import React, { useState } from "react";
import {
  Send,
  CheckCircle,
  XCircle,
  Play,
  Square,
  Loader2,
  Code,
  BookOpen,
  History,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const MainContent = ({
  room,
  user,
  currentChallenge,
  isGenerating,
  onGenerateChallenge,
  onEndChallenge,
  selectedLanguage,
  onLanguageChange,
  languages,
  userCode,
  setUserCode,
  isSubmitting,
  onSubmitSolution,
  submissions,
  getStatusColor,
}) => {
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

  return (
    <div className="lg:col-span-3 ">
      {/* Challenge Controls */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.name === room?.createdBy && (
              <button
                onClick={
                  room?.status === "active"
                    ? onEndChallenge
                    : onGenerateChallenge
                }
                disabled={isGenerating}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all ${
                  room?.status === "active"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : room?.status === "active" ? (
                  <>
                    <Square className="w-4 h-4" />
                    End Challenge
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Challenge
                  </>
                )}
              </button>
            )}
            {room?.status === "active" && (
              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium text-sm">
                  Challenge Active
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-300">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Language:</span>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-gray-700">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!currentChallenge && !isGenerating ? (
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
          <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Code?</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Generate a challenge to get started with your coding session.
            Challenge yourself with problems tailored to your selected
            difficulty and topic.
          </p>
          {user?.name === room?.createdBy ? (
            <button
              onClick={onGenerateChallenge}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              Generate Challenge
            </button>
          ) : (
            <p className="text-gray-500">
              Waiting for{" "}
              <span className="text-blue-400 font-medium">
                {room?.createdBy}
              </span>{" "}
              to generate a challenge...
            </p>
          )}
        </div>
      ) : isGenerating ? (
        <div className="bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-700">
          <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Generating Challenge...
          </h2>
          <p className="text-gray-400">
            Creating a perfect challenge for you. This may take a moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Problem Statement */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-700/50 p-4 border-b border-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Problem</h3>
              </div>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white">
                    {currentChallenge.title}
                  </h2>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
                    {room.difficulty}
                  </span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {currentChallenge.description}
                  </p>
                </div>
                {currentChallenge.examples && (
                  <div>
                    <h4 className="text-md font-semibold mb-3 text-white">
                      Examples
                    </h4>
                    <div className="space-y-4">
                      {currentChallenge.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                        >
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-400">
                              Input:
                            </span>
                            <div className="mt-1 bg-gray-900/50 p-2 rounded-md font-mono text-sm text-gray-300">
                              {ex.input}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-400">
                              Output:
                            </span>
                            <div className="mt-1 bg-gray-900/50 p-2 rounded-md font-mono text-sm text-gray-300">
                              {ex.output}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Code Editor and Submissions */}
          <div className="space-y-6">
            {/* Code Editor */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              <div className="bg-gray-700/50 p-4 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Solution
                    </h3>
                  </div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-400 border border-gray-600">
                    {selectedLanguage}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-80 font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Write your code here..."
                      spellCheck={false}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={onSubmitSolution}
                      disabled={isSubmitting || !userCode.trim()}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Solution
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submissions Panel */}
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowSubmissions(!showSubmissions)}
                className="w-full bg-gray-700/50 p-4 border-b border-gray-600 flex items-center justify-between hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Submissions
                  </h3>
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
                <div className="p-4 max-h-60 overflow-y-auto">
                  {submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        No submissions yet
                      </p>
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
                              <span className="font-medium">Score:</span>{" "}
                              {sub.score}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
