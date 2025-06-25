"use client";
import React, { useEffect, useRef } from "react";

const MonacoEditor = ({ value, onChange, language, theme, options }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js";
    script.onload = () => {
      window.require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
        },
      });

      window.require(["vs/editor/editor.main"], () => {
        if (containerRef.current && !editorRef.current) {
          monacoRef.current = window.monaco;

          // Themes
          window.monaco.editor.defineTheme("dark-custom", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "comment", foreground: "6A9955", fontStyle: "italic" },
              { token: "keyword", foreground: "569CD6" },
              { token: "string", foreground: "CE9178" },
              { token: "number", foreground: "B5CEA8" },
              { token: "type", foreground: "4EC9B0" },
              { token: "function", foreground: "DCDCAA" },
            ],
            colors: {
              "editor.background": "#1e293b",
              "editor.foreground": "#f8fafc",
              "editor.lineHighlightBackground": "#334155",
              "editor.selectionBackground": "#475569",
              "editorCursor.foreground": "#a855f7",
              "editorLineNumber.foreground": "#64748b",
              "editorLineNumber.activeForeground": "#e2e8f0",
            },
          });

          window.monaco.editor.defineTheme("light-custom", {
            base: "vs",
            inherit: true,
            rules: [
              { token: "comment", foreground: "008000", fontStyle: "italic" },
              { token: "keyword", foreground: "0000FF" },
              { token: "string", foreground: "A31515" },
              { token: "number", foreground: "098658" },
              { token: "type", foreground: "267F99" },
              { token: "function", foreground: "795E26" },
            ],
            colors: {
              "editor.background": "#ffffff",
              "editor.foreground": "#000000",
              "editor.lineHighlightBackground": "#f0f0f0",
              "editor.selectionBackground": "#add6ff",
              "editorCursor.foreground": "#000000",
            },
          });

          editorRef.current = monacoRef.current.editor.create(
            containerRef.current,
            {
              value: value || "",
              language: language || "javascript",
              theme: theme || "dark-custom",
              automaticLayout: true,
              fontSize: 14,
              fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              minimap: { enabled: true },
              folding: true,
              lineHeight: 21,
              letterSpacing: 0.5,
              wordWrap: "on",
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: false,
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true,
              },
              ...options,
            }
          );

          editorRef.current.onDidChangeModelContent(() => {
            const newValue = editorRef.current.getValue();
            onChange?.(newValue);
          });
        }
      });
    };
    document.head.appendChild(script);

    return () => editorRef.current?.dispose();
  }, []);

  useEffect(() => {
    if (
      editorRef.current &&
      typeof value === "string" &&
      value !== editorRef.current.getValue()
    ) {
      const model = editorRef.current.getModel();
      if (model) {
        const currentValue = model.getValue();
        if (currentValue !== value) {
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: value,
              },
            ],
            () => null
          );
        }
      }
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setModelLanguage(
        editorRef.current.getModel(),
        language || "javascript"
      );
    }
  }, [language]);

  useEffect(() => {
    editorRef.current?.updateOptions({ theme: theme || "dark-custom" });
  }, [theme]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MonacoEditor;
