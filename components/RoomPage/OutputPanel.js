import { X, Loader2, Terminal } from "lucide-react";

export default function OutputPanel({
  showOutput,
  setShowOutput,
  outputPanelHeight,
  handleMouseDown,
  isCompiling,
  compilationResult,
  getStatusIcon,
  customInput,
  setCustomInput,
}) {
  return (
    showOutput && (
      <div className="shrink-0 border-t-2 border-slate-700">
        <div
          onMouseDown={handleMouseDown}
          className="h-1 sm:h-2 bg-slate-700 hover:bg-slate-600 cursor-row-resize flex items-center justify-center transition-colors"
        >
          <div className="w-8 sm:w-10 h-0.5 sm:h-1 bg-slate-500 rounded-full"></div>
        </div>
        <div
          style={{
            height:
              window.innerWidth < 768
                ? Math.min(outputPanelHeight, 200)
                : outputPanelHeight,
          }}
          className="bg-slate-800 flex flex-col lg:flex-row"
        >
          <div className="flex-1 flex flex-col h-full lg:w-2/3">
            <div className="p-2 sm:p-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-300">
                Output
              </h3>
              <button
                onClick={() => setShowOutput(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Close Output Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-2 sm:p-4 overflow-auto">
              {isCompiling ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-400" />
                    <span className="text-sm sm:text-base text-gray-300">
                      Compiling and running...
                    </span>
                  </div>
                </div>
              ) : compilationResult ? (
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(compilationResult.statusId)}
                    <span
                      className={`font-semibold ${
                        compilationResult.statusId === 3
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {compilationResult.status}
                    </span>
                    {compilationResult.time !== null && (
                      <span className="text-xs text-gray-500">
                        (time: {compilationResult.time}s, memory:{" "}
                        {compilationResult.memory}KB)
                      </span>
                    )}
                  </div>
                  {compilationResult.output && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                        STDOUT
                      </h4>
                      <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-green-300 whitespace-pre-wrap break-all">
                        {compilationResult.output}
                      </pre>
                    </div>
                  )}
                  {compilationResult.stderr && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                        STDERR
                      </h4>
                      <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-red-400 whitespace-pre-wrap break-all">
                        {compilationResult.stderr}
                      </pre>
                    </div>
                  )}
                  {compilationResult.compile_output && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                        COMPILE OUTPUT
                      </h4>
                      <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-yellow-400 whitespace-pre-wrap break-all">
                        {compilationResult.compile_output}
                      </pre>
                    </div>
                  )}
                  {compilationResult.message && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 mb-2 tracking-wider">
                        ERROR
                      </h4>
                      <pre className="bg-slate-900 p-3 rounded border border-slate-700 font-mono text-red-400 whitespace-pre-wrap break-all">
                        {compilationResult.message}
                      </pre>
                    </div>
                  )}
                  {!compilationResult.output &&
                    !compilationResult.stderr &&
                    !compilationResult.compile_output &&
                    !compilationResult.message &&
                    compilationResult.statusId === 3 && (
                      <div className="flex flex-col items-center justify-center text-center py-8">
                        <Terminal className="w-10 h-10 text-gray-600 mb-2" />
                        <p className="text-gray-500">
                          Execution successful, but no output was generated.
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <Terminal className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 mb-2" />
                  <p className="text-gray-500 text-sm sm:text-base">
                    Click "Run" to see the output here
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="h-40 lg:h-full lg:w-1/3 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col">
            <div className="p-2 sm:p-3 border-b border-slate-700">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-300">
                Custom Input (stdin)
              </h3>
            </div>
            <div className="flex-1 p-1 sm:p-2">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input for your program..."
                className="w-full h-full bg-slate-900 text-white text-xs sm:text-sm font-mono p-2 sm:p-3 rounded-md border border-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
}
