import React from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import {
  Header,
  Tabs,
  Editor,
  TabNameModal,
  OutputPanel,
  Sidebar,
} from "@/components/RoomPage";
import { languages, themes } from "@/lib/constants";

export const RoomLayout = ({
  roomId,
  roomData,
  currentUser,
  users,
  tabs,
  activeTab,
  tabContents,
  editorTheme,
  setEditorTheme,
  showOutput,
  setShowOutput,
  outputPanelHeight,
  isCompiling,
  compilationResult,
  customInput,
  setCustomInput,
  isSidebarOpen,
  setIsSidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  messages,
  chatMessage,
  setChatMessage,
  messagesEndRef,
  showTabNameModal,
  setShowTabNameModal,
  newTabName,
  setNewTabName,
  copied,
  // Functions
  leaveRoom,
  copyRoomId,
  compileAndRun,
  isLanguageSupported,
  getCurrentTabLanguage,
  downloadCode,
  switchTab,
  createNewTab,
  handleDeleteTab,
  getCurrentTabContent,
  handleCodeChange,
  handleSendMessage,
  handleLanguageChange,
  handleMouseDown,
  handleCreateTabWithName,
  handleShareTab, // Add this function
}) => {
  const getStatusIcon = (statusId) => {
    if (statusId === 3)
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (statusId >= 4 && statusId <= 12)
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (statusId === 5) return <Clock className="w-5 h-5 text-yellow-400" />;
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      <Header
        roomData={roomData}
        roomId={roomId}
        leaveRoom={leaveRoom}
        copyRoomId={copyRoomId}
        copied={copied}
        compileAndRun={compileAndRun}
        isCompiling={isCompiling}
        isLanguageSupported={isLanguageSupported}
        getCurrentTabLanguage={getCurrentTabLanguage}
        languages={languages}
        downloadCode={downloadCode}
        showOutput={showOutput}
        setShowOutput={setShowOutput}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
        <div className="flex-1 flex gap-2 overflow-hidden">
          <main className="flex-1 flex flex-col min-w-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              currentUser={currentUser}
              switchTab={switchTab}
              createNewTab={createNewTab}
              handleDeleteTab={handleDeleteTab}
              handleShareTab={handleShareTab} // Pass the function
            />
            <Editor
              activeTab={activeTab}
              getCurrentTabContent={getCurrentTabContent}
              handleCodeChange={handleCodeChange}
              getCurrentTabLanguage={getCurrentTabLanguage}
              editorTheme={editorTheme}
              fontSize={14}
              showOutput={showOutput}
              outputPanelHeight={outputPanelHeight}
            />
          </main>

          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            activeSidebarTab={activeSidebarTab}
            setActiveSidebarTab={setActiveSidebarTab}
            users={users}
            currentUser={currentUser}
            tabs={tabs}
            messages={messages}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            handleSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
            handleLanguageChange={handleLanguageChange}
            getCurrentTabLanguage={getCurrentTabLanguage}
            languages={languages}
            isLanguageSupported={isLanguageSupported}
            editorTheme={editorTheme}
            setEditorTheme={setEditorTheme}
            themes={themes}
            downloadCode={downloadCode}
          />
        </div>

        {showOutput && (
          <OutputPanel
            showOutput={showOutput}
            setShowOutput={setShowOutput}
            outputPanelHeight={outputPanelHeight}
            handleMouseDown={handleMouseDown}
            isCompiling={isCompiling}
            compilationResult={compilationResult}
            getStatusIcon={getStatusIcon}
            customInput={customInput}
            setCustomInput={setCustomInput}
          />
        )}
      </div>

      <TabNameModal
        showTabNameModal={showTabNameModal}
        setShowTabNameModal={setShowTabNameModal}
        newTabName={newTabName}
        setNewTabName={setNewTabName}
        handleCreateTabWithName={handleCreateTabWithName}
      />

      {isSidebarOpen &&
        typeof window !== "undefined" &&
        window.innerWidth < 1024 && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
    </div>
  );
};
