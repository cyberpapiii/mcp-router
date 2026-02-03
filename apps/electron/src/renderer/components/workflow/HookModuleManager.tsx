import React, { useEffect, useState } from "react";
import { HookModule } from "@mcp_router/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Textarea,
} from "@mcp_router/ui";
import { Button, Input, Label } from "@mcp_router/ui";
import { Plus, Edit2, Trash2, Play, ChevronDown } from "lucide-react";
import HookModuleEditor from "./HookModuleEditor";
import { useHookStore } from "../../stores/hook-store";
import { usePlatformAPI } from "../../platform-api/hooks/use-platform-api";

interface HookModuleManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModuleSelect?: (moduleId: string) => void;
}

export default function HookModuleManager({
  open,
  onOpenChange,
  onModuleSelect,
}: HookModuleManagerProps) {
  const platformAPI = usePlatformAPI();
  const {
    modules,
    editingModule,
    isCreating,
    formData,
    setFormData,
    loadModules,
    handleCreate,
    handleUpdate,
    handleDelete,
    startEdit,
    startCreate,
    resetForm,
  } = useHookStore();

  useEffect(() => {
    if (open) {
      loadModules(platformAPI);
    }
  }, [open, loadModules, platformAPI]);

  const cancelEdit = resetForm;

  // Test Hook state
  const [testContext, setTestContext] = useState<string>(
    '{\n  "request": {},\n  "response": {}\n}',
  );
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTestOpen, setIsTestOpen] = useState<boolean>(false);

  // Validation state
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);

  const handleValidate = async () => {
    if (!formData.script) return;
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await platformAPI.workflows.hooks.validate(
        formData.script,
      );
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        error: error instanceof Error ? error.message : "Validation failed",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRunTest = async () => {
    if (!editingModule) return;

    setIsTestRunning(true);
    setTestResult(null);
    setTestError(null);

    try {
      const parsedContext = JSON.parse(testContext);
      const result = await platformAPI.workflows.hooks.execute(
        editingModule.id,
        parsedContext,
      );
      setTestResult(result);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setTestError(`Invalid JSON: ${error.message}`);
      } else if (error instanceof Error) {
        setTestError(error.message);
      } else {
        setTestError("An unexpected error occurred");
      }
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Hook Modules</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Module List */}
          {!isCreating && !editingModule && (
            <div>
              <div className="flex justify-end mb-4">
                <Button onClick={startCreate} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Module
                </Button>
              </div>

              <div className="space-y-2">
                {modules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No modules yet. Create your first module!
                  </p>
                ) : (
                  modules.map((module: HookModule) => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{module.name}</div>
                      </div>
                      <div className="flex gap-2">
                        {onModuleSelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onModuleSelect(module.id);
                              onOpenChange(false);
                            }}
                          >
                            Select
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(module)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(platformAPI, module.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create/Edit Form */}
          {(isCreating || editingModule) && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Module Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Rate Limit Handler"
                />
              </div>

              <div>
                <Label>Module Code</Label>
                <HookModuleEditor
                  value={formData.script || ""}
                  onChange={(value) => {
                    setFormData({ ...formData, script: value });
                    // Clear validation result when code changes
                    if (validationResult) setValidationResult(null);
                  }}
                  height="300px"
                  onValidate={handleValidate}
                  isValidating={isValidating}
                  validationResult={validationResult}
                />
              </div>

              {/* Test Hook Section - only show when editing an existing module */}
              {editingModule && (
                <Collapsible open={isTestOpen} onOpenChange={setIsTestOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex w-full items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <span className="font-medium">Test Hook</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isTestOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="testContext">Test Context (JSON)</Label>
                      <Textarea
                        id="testContext"
                        value={testContext}
                        onChange={(e) => setTestContext(e.target.value)}
                        placeholder='{"request": {...}, "response": {...}}'
                        className="font-mono text-sm min-h-[120px]"
                      />
                    </div>
                    <Button
                      onClick={handleRunTest}
                      disabled={isTestRunning}
                      size="sm"
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {isTestRunning ? "Running..." : "Run Test"}
                    </Button>

                    {/* Test Result Display */}
                    {testResult !== null && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <Label className="text-green-700 dark:text-green-400">
                          Result:
                        </Label>
                        <pre className="mt-1 text-sm font-mono text-green-800 dark:text-green-300 whitespace-pre-wrap overflow-auto max-h-[200px]">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Test Error Display */}
                    {testError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <Label className="text-red-700 dark:text-red-400">
                          Error:
                        </Label>
                        <pre className="mt-1 text-sm font-mono text-red-800 dark:text-red-300 whitespace-pre-wrap">
                          {testError}
                        </pre>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingModule) {
                      handleUpdate(platformAPI);
                    } else {
                      handleCreate(platformAPI);
                    }
                  }}
                >
                  {editingModule ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
