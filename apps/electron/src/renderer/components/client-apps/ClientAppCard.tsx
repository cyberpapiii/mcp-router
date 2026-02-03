import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@mcp_router/ui";
import { Badge } from "@mcp_router/ui";
import { Button } from "@mcp_router/ui";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { ClientApp } from "@mcp_router/shared";

interface ClientAppCardProps {
  clientApp: ClientApp;
  onServerAccess: () => void;
  onHowToUse: () => void;
  onConfigure: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ClientAppCard: React.FC<ClientAppCardProps> = ({
  clientApp,
  onServerAccess,
  onHowToUse,
  onConfigure,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    if (clientApp.isCustom) {
      return <Badge variant="default">{t("clientApps.custom")}</Badge>;
    }
    if (!clientApp.installed) {
      return <Badge variant="outline">{t("clientApps.notInstalled")}</Badge>;
    }
    return <Badge variant="secondary">{t("clientApps.installed")}</Badge>;
  };

  const isConfigured = clientApp.mcpConfigured || clientApp.skillsConfigured;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {clientApp.icon && (
              <div
                className="w-6 h-6 flex items-center justify-center"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                dangerouslySetInnerHTML={{
                  __html: clientApp.icon.replace(
                    /<svg/g,
                    '<svg style="width: 100%; height: 100%; max-width: 24px; max-height: 24px;"',
                  ),
                }}
              />
            )}
            <CardTitle className="truncate max-w-[150px]">
              {clientApp.name}
            </CardTitle>
          </div>
          <div className="flex gap-2">{getStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* MCP Status */}
          <div className="flex items-center gap-2 text-sm">
            {clientApp.mcpConfigured ? (
              <IconCheck size={16} className="text-green-600 shrink-0" />
            ) : (
              <IconX size={16} className="text-destructive shrink-0" />
            )}
            <span>
              {clientApp.mcpConfigured
                ? t("clientApps.mcpConfigured")
                : t("clientApps.mcpNotConfigured")}
            </span>
          </div>

          {/* Skills Status */}
          <div className="flex items-center gap-2 text-sm">
            {clientApp.skillsConfigured ? (
              <IconCheck size={16} className="text-green-600 shrink-0" />
            ) : (
              <IconX size={16} className="text-destructive shrink-0" />
            )}
            <span>
              {clientApp.skillsConfigured
                ? t("clientApps.skillsSynced")
                : t("clientApps.skillsNotSetUp")}
            </span>
          </div>

          {/* Show paths for custom clients */}
          {clientApp.isCustom && (
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {clientApp.mcpConfigPath && (
                <div className="truncate" title={clientApp.mcpConfigPath}>
                  <span className="font-medium">
                    {t("clientApps.addCustomClient.mcpConfigPath")}:
                  </span>{" "}
                  {clientApp.mcpConfigPath}
                </div>
              )}
              {clientApp.skillsPath && (
                <div className="truncate" title={clientApp.skillsPath}>
                  <span className="font-medium">
                    {t("clientApps.addCustomClient.skillsPath")}:
                  </span>{" "}
                  {clientApp.skillsPath}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 justify-between flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {isConfigured && clientApp.token && (
            <Button variant="outline" size="sm" onClick={onHowToUse}>
              {t("clientApps.howToUse")}
            </Button>
          )}
          {clientApp.isCustom && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              {t("clientApps.delete")}
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isConfigured ? (
            <Button
              onClick={onConfigure}
              variant="default"
              disabled={!clientApp.installed}
            >
              {t("clientApps.configure")}
            </Button>
          ) : (
            <>
              {clientApp.isCustom && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  {t("clientApps.edit")}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onServerAccess}>
                {t("clientApps.serverAccess")}
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientAppCard;
