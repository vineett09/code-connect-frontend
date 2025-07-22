import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const TestCasePanel = ({ testResults }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!testResults || testResults.length === 0) return null;

  // Helper function to check if test case passed
  const isTestPassed = (testCase) => {
    if (testCase.error) return false;
    if (typeof testCase.passed === "boolean") {
      return testCase.passed;
    }
    return (
      JSON.stringify(testCase.actual) === JSON.stringify(testCase.expected)
    );
  };

  // Count passed/failed tests for the header
  const passedCount = testResults.filter(isTestPassed).length;
  const totalCount = testResults.length;

  return (
    <div className="mt-6 w-full border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-200">Test Cases</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">{passedCount} passed</span>
            <span className="text-gray-400">•</span>
            <span className="text-red-400">
              {totalCount - passedCount} failed
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">{totalCount} total</span>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded transition-all duration-200"
        >
          {isMinimized ? (
            <>
              <ChevronDown size={16} />
            </>
          ) : (
            <>
              <ChevronUp size={16} />
            </>
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isMinimized && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-700 bg-gray-800">
            <div className="flex overflow-x-auto">
              {testResults.map((tc, index) => (
                <button
                  key={index}
                  className={`
                    flex items-center gap-2 px-4 py-3 border-none bg-transparent 
                    cursor-pointer text-sm font-medium whitespace-nowrap 
                    transition-all duration-200 border-b-2 border-transparent
                    hover:bg-gray-700
                    ${
                      activeTab === index
                        ? "bg-gray-900 border-b-blue-400 text-blue-400"
                        : "text-gray-300"
                    }
                  `}
                  onClick={() => setActiveTab(index)}
                >
                  <span className="flex-shrink-0">
                    {isTestPassed(tc) ? (
                      <CheckCircle className="text-green-400" size={16} />
                    ) : (
                      <XCircle className="text-red-400" size={16} />
                    )}
                  </span>
                  Test Case {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-gray-900">
            {testResults.map((tc, index) => (
              <div
                key={index}
                className={`${activeTab === index ? "block" : "hidden"}`}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-2">
                    <strong className="font-semibold text-gray-200">
                      Input:
                    </strong>
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded border border-gray-600 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(tc.input, null, 2)}
                    </pre>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <strong className="font-semibold text-gray-200">
                      Expected:
                    </strong>
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded border border-gray-600 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(tc.expected, null, 2)}
                    </pre>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <strong className="font-semibold text-gray-200">
                      Actual:
                    </strong>
                    <pre className="bg-gray-800 text-gray-100 p-3 rounded border border-gray-600 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(tc.actual, null, 2)}
                    </pre>
                  </div>

                  {tc.error && (
                    <div className="flex flex-col space-y-2">
                      <strong className="font-semibold text-red-400">
                        Error:
                      </strong>
                      <pre className="bg-red-900/30 text-red-300 p-3 rounded border border-red-500/50 font-mono text-sm">
                        {tc.error}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TestCasePanel;
