import React from "react";
import { useTranslation } from "react-i18next";
import { Code, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Switch,
  Input,
  Label,
} from "@mcp_router/ui";
import { MCPServer } from "@mcp_router/shared";

interface ServerDetailsDevModeProps {
  server: MCPServer;
  editedDevEnabled: boolean;
  setEditedDevEnabled: (enabled: boolean) => void;
  editedWatchPatterns: string;
  setEditedWatchPatterns: (patterns: string) => void;
  detectedSourceDir?: string | null;
}

const ServerDetailsDevMode: React.FC<ServerDetailsDevModeProps> = ({
  server,
  editedDevEnabled,
  setEditedDevEnabled,
  editedWatchPatterns,
  setEditedWatchPatterns,
  detectedSourceDir,
}) => {
  const { t } = useTranslation();

  // Handle hot reload toggle with auto-population of watch patterns
  const handleHotReloadChange = (enabled: boolean) => {
    setEditedDevEnabled(enabled);

    // Auto-populate watch patterns when enabling hot reload with empty patterns
    if (enabled && !editedWatchPatterns.trim() && detectedSourceDir) {
      const defaultPatterns = [
        `${detectedSourceDir}/**/*.ts`,
        `${detectedSourceDir}/**/*.js`,
        `${detectedSourceDir}/**/*.json`,
      ].join(", ");
      setEditedWatchPatterns(defaultPatterns);
    }
  };

  return (
    <Collapsible className="group/collapsible-dev">
      <div className="border rounded-lg">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {t("serverDetails.developerOptions", {
                defaultValue: "Developer Options",
              })}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]/collapsible-dev:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-4">
            {/* Enable Hot Reload Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
              <div className="space-y-1">
                <Label
                  htmlFor="dev-enabled"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t("serverDetails.enableHotReload", {
                    defaultValue: "Enable Hot Reload",
                  })}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("serverDetails.enableHotReloadDescription", {
                    defaultValue:
                      "Automatically restart the server when source files change",
                  })}
                </p>
              </div>
              <Switch
                id="dev-enabled"
                checked={editedDevEnabled}
                onCheckedChange={handleHotReloadChange}
              />
            </div>

            {/* Watch Patterns Input */}
            <div className="space-y-2">
              <Label
                htmlFor="watch-patterns"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                {t("serverDetails.watchPatterns", {
                  defaultValue: "Watch Patterns",
                })}
              </Label>
              <Input
                id="watch-patterns"
                value={editedWatchPatterns}
                onChange={(e) => setEditedWatchPatterns(e.target.value)}
                placeholder="src/**/*.ts, lib/**/*.js"
                className="font-mono text-sm"
                disabled={!editedDevEnabled}
              />
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                {t("serverDetails.watchPatternsHelp", {
                  defaultValue:
                    "Comma-separated glob patterns for files to watch. Changes to matching files will trigger a server restart.",
                })}
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ServerDetailsDevMode;
