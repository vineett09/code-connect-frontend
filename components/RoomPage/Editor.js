import MonacoEditor from "@/components/MonacoEditor";

export default function Editor({
  activeTab,
  getCurrentTabContent,
  handleCodeChange,
  getCurrentTabLanguage,
  editorTheme,
  fontSize,
}) {
  return (
    <div className="flex-1 h-[calc(100vh-10rem)] bg-slate-800 rounded-lg border border-slate-700 overflow-hidden relative">
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
