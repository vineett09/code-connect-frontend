// components/challengeRoom/TerminalPanel.jsx
import { TerminalSquare } from "lucide-react";

const TerminalPanel = ({ rawError }) => {
  if (!rawError) return null;

  return (
    <div className="bg-black rounded-xl shadow-lg border border-red-500/30 p-4 mt-4">
      <h3 className="text-md font-semibold text-red-400 mb-2 flex items-center gap-2">
        <TerminalSquare className="w-5 h-5" />
        Compilation / Runtime Error
      </h3>
      {/* Keep the same full-width block for readability */}
      <pre className="text-sm text-red-300 overflow-x-auto whitespace-pre-wrap">
        {rawError}
      </pre>
    </div>
  );
};

export default TerminalPanel;
