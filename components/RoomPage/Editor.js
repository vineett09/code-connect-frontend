import MonacoEditor from "@/components/MonacoEditor";

export default function Editor({
  activeTab,
  getCurrentTabContent,
  handleCodeChange,
  getCurrentTabLanguage,
  editorTheme,
  fontSize,
  showOutput,
  outputPanelHeight,
}) {
  return (
    <div
      className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden relative"
      style={{
        height: showOutput
          ? `calc(100% - ${outputPanelHeight}px - 0.5rem)`
          : "100%",
        transition: "height 0.3s ease-in-out",
      }}
    >
      <MonacoEditor
        key={activeTab}
        value={getCurrentTabContent()}
        onChange={handleCodeChange}
        language={getCurrentTabLanguage()}
        theme={editorTheme}
        options={{
          fontSize: window.innerWidth < 640 ? 12 : fontSize,
          minimap: { enabled: window.innerWidth >= 768 },
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          roundedSelection: false,
          lineNumbers: window.innerWidth < 640 ? "off" : "on",
          folding: window.innerWidth >= 768,
          overviewRulerLanes: window.innerWidth >= 768 ? 3 : 0,
        }}
      />
    </div>
  );
}
