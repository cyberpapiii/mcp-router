import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { Button } from "@mcp_router/ui";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface HookModuleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
  onValidate?: () => void;
  isValidating?: boolean;
  validationResult?: { valid: boolean; error?: string } | null;
}

export default function HookModuleEditor({
  value,
  onChange,
  placeholder = "// Write your hook module code here...",
  height = "400px",
  readOnly = false,
  onValidate,
  isValidating = false,
  validationResult,
}: HookModuleEditorProps) {
  const extensions = [
    javascript({ typescript: true }),
    EditorView.theme({
      "&": {
        fontSize: "14px",
      },
      ".cm-content": {
        padding: "10px",
      },
      ".cm-focused .cm-cursor": {
        borderLeftColor: "#528bff",
      },
      ".cm-line": {
        padding: "0 2px",
      },
    }),
    EditorView.lineWrapping,
  ];

  const handleChange = (val: string) => {
    if (!readOnly) {
      onChange(val);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border rounded-lg overflow-hidden">
        <CodeMirror
          value={value}
          height={height}
          theme={oneDark}
          extensions={extensions}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {onValidate && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onValidate}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              "Validate Syntax"
            )}
          </Button>

          {validationResult && (
            <div className="flex items-center gap-2">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    Syntax is valid
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">
                    {validationResult.error || "Invalid syntax"}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
