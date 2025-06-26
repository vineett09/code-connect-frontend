export default function TabNameModal({
  showTabNameModal,
  setShowTabNameModal,
  newTabName,
  setNewTabName,
  handleCreateTabWithName,
}) {
  return (
    showTabNameModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 w-96 max-w-[90vw]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Create New Tab
          </h3>
          <input
            type="text"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            placeholder="Enter tab name..."
            className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all mb-4"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateTabWithName();
              }
            }}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowTabNameModal(false);
                setNewTabName("");
              }}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTabWithName}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              Create Tab
            </button>
          </div>
        </div>
      </div>
    )
  );
}
