import { Plus, X } from "lucide-react";

export default function Tabs({
  tabs,
  activeTab,
  switchTab,
  createNewTab,
  handleDeleteTab,
}) {
  return (
    <div className="shrink-0 bg-slate-800 border-b border-slate-700 px-1 sm:px-2 md:px-4">
      <div className="flex items-center min-h-0">
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto py-1.5 sm:py-2 flex-1 min-w-0 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center group py-1.5 sm:py-2.5 text-xs sm:text-sm rounded-md whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeTab === tab.id
                  ? "bg-slate-700 text-white font-semibold pl-2 sm:pl-4 pr-1 sm:pr-2"
                  : "bg-transparent text-gray-300 hover:bg-slate-700/50 hover:text-white px-2 sm:px-4"
              }`}
            >
              <span className="truncate max-w-20 sm:max-w-none">
                {tab.name}
              </span>
              {tab.id !== "main" && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTab(tab.id);
                  }}
                  className="ml-1 sm:ml-2 p-0.5 sm:p-1 rounded-full text-gray-400 opacity-50 group-hover:opacity-100 hover:!opacity-100 hover:bg-red-500 hover:text-white transition-all shrink-0"
                  title="Delete Tab"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={createNewTab}
          className="ml-1 sm:ml-2 p-1 sm:p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors shrink-0"
          title="Create New Tab"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
