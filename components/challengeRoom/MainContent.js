import React from "react";
import {
  Send,
  Play,
  Square,
  Loader2,
  Code,
  BookOpen,
  Zap,
  AlertCircle,
} from "lucide-react";
import TestCasePanel from "@/components/challengeRoom/TestCasePanel";
import TerminalPanel from "@/components/challengeRoom/TerminalPanel";
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
  lastSubmission,
  aiGenerationError,
  onRetryGeneration,
  isSavingCode,
  codeSaved,
}) => {
  return (
    <div>
      {aiGenerationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-red-800 font-medium">
                Challenge Generation Failed
              </h3>
              <p className="text-red-600 text-sm mt-1">{aiGenerationError}</p>
              <button
                onClick={onRetryGeneration}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Challenge Controls */}
      {/* ────── Responsive Challenge Controls ────── */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 mb-6 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Left side: owner controls + status */}
          <div className="flex items-center gap-3 flex-wrap">
            {user?.name === room?.createdBy && (
              <button
                onClick={
                  room?.status === "active"
                    ? onEndChallenge
                    : onGenerateChallenge
                }
                disabled={isGenerating}
                className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all
        ${
          room?.status === "active"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700"
        }
        disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Generating...</span>
                  </>
                ) : room?.status === "active" ? (
                  <>
                    <Square className="w-4 h-4 shrink-0" />
                    <span>End Challenge</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0" />
                    <span>Generate Challenge</span>
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

          {/* Right side: language selector */}
          <div className="flex items-center gap-2 text-gray-300 flex-wrap">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 shrink-0" />
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

        {/* Owner warning (visible when active) */}
        {user?.name === room?.createdBy &&
          room?.status === "active" &&
          currentChallenge && (
            <div className="mt-3 flex items-center justify-center gap-2 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-400 text-sm">
                End the challenge before leaving to save results.
              </span>
            </div>
          )}
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
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Side - Problem Statement */}
          <div className="lg:col-span-3 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-[600px] flex flex-col">
            <div className="bg-gray-700/50 p-4 border-b border-gray-600 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Problem</h3>
              </div>
            </div>
            <div className="p-6 max-h-[500px] overflow-y-auto scrollbar-hide">
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
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden h-[600px] flex flex-col">
              <div className="bg-gray-700/50 p-4 border-b border-gray-600 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Solution
                    </h3>
                    {room?.status === "active" && (
                      <div className="ml-4">
                        {isSavingCode && (
                          <span className="text-xs text-yellow-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            Saving...
                          </span>
                        )}
                        {codeSaved && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Code saved
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-400 border border-gray-600">
                    {selectedLanguage}
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1">
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full h-full font-mono text-sm bg-gray-900 border border-gray-600 rounded-lg p-4 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Write your code here..."
                      spellCheck={false}
                    />
                  </div>
                  <div className="flex justify-end flex-shrink-0">
                    <button
                      onClick={onSubmitSolution}
                      disabled={isSubmitting || !(userCode || "").trim()}
                      value={userCode || ""}
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
          </div>
        </div>
      )}
      {lastSubmission && (
        <>
          <TestCasePanel testResults={lastSubmission.testResults} />
          <TerminalPanel
            rawError={
              lastSubmission.error ||
              lastSubmission.testResults?.find((t) => t.error)?.error ||
              lastSubmission.testResults?.find((t) => t.compilationError)
                ?.compilationError
            }
          />
        </>
      )}
    </div>
  );
};

export default MainContent;
