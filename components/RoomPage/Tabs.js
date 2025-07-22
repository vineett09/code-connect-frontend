import { Plus, X, Lock, Users, Eye, EyeOff } from "lucide-react";
export default function Tabs({
  tabs,
  activeTab,
  currentUser,
  switchTab,
  createNewTab,
  handleDeleteTab,
  handleShareTab,
}) {
  return (
    <div className="shrink-0 bg-slate-800 border-b border-slate-700 px-1 sm:px-2 md:px-4 mb-2 rounded-md">
      <div className="flex items-center min-h-0">
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto py-1.5 sm:py-2 flex-1 min-w-0 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {tabs.map((tab) => {
            const isOwner = tab.createdBy === currentUser?.id;
            const isSystemTab = tab.createdBy === "system";
            const isMainTab = tab.id === "main";
            const isPrivate = !tab.isPublic;
            const canDelete = isOwner && !isMainTab && !isSystemTab;
            const canChangePrivacy = isOwner && !isMainTab && !isSystemTab;

            return (
              <div
                key={tab.id}
                className={`flex items-center group rounded-md whitespace-nowrap transition-all duration-200 shrink-0 ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-white font-semibold"
                    : "bg-transparent text-gray-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <button
                  onClick={() => switchTab(tab.id)}
                  className={`flex items-center py-1.5 sm:py-2.5 text-xs sm:text-sm transition-all duration-200 ${
                    activeTab === tab.id ? "pl-2 sm:pl-4 pr-1" : "px-2 sm:px-4"
                  }`}
                >
                  <span className="truncate max-w-20 sm:max-w-none flex items-center gap-1.5">
                    {tab.name}
                    {/* Show privacy indicator for non-main tabs */}
                    {!isMainTab && (
                      <>
                        {isPrivate ? (
                          <Lock
                            className="w-3 h-3 text-amber-400"
                            title="Private Tab - Only you can see this"
                          />
                        ) : (
                          <Users
                            className="w-3 h-3 text-green-400"
                            title="Shared Tab - Everyone can see this"
                          />
                        )}
                      </>
                    )}
                  </span>
                </button>

                {/* Share/Unshare button - only for tab owners and not main/system tabs */}
                {canChangePrivacy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareTab(tab.id, !tab.isPublic);
                    }}
                    className={`ml-1 p-0.5 sm:p-1 rounded-full opacity-60 group-hover:opacity-100 hover:!opacity-100 transition-all shrink-0 ${
                      tab.isPublic
                        ? "text-green-400 hover:bg-amber-500/20 hover:text-amber-300"
                        : "text-amber-400 hover:bg-green-500/20 hover:text-green-300"
                    }`}
                    title={
                      tab.isPublic ? "Make Private (Unshare)" : "Share Tab"
                    }
                  >
                    {tab.isPublic ? (
                      <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    ) : (
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    )}
                  </button>
                )}

                {/* Delete button - only for tab owners and not main/system tabs */}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Are you sure you want to delete "${tab.name}"?`
                        )
                      ) {
                        handleDeleteTab(tab.id);
                      }
                    }}
                    className="ml-1 p-0.5 sm:p-1 rounded-full text-gray-400 opacity-50 group-hover:opacity-100 hover:!opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all shrink-0"
                    title="Delete Tab"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={createNewTab}
          className="ml-1 sm:ml-2 p-1 sm:p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors shrink-0"
          title="Create New Private Tab"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
