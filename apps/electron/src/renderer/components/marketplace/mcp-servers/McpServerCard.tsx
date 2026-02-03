import React from "react";
import { Card, CardContent } from "@mcp_router/ui";
import { Badge } from "@mcp_router/ui";
import { CheckCircle2, Server } from "lucide-react";
import { cn } from "@/renderer/utils/tailwind-utils";

export interface RegistryServer {
  name: string;
  description: string;
  version: string;
  title?: string;
  websiteUrl?: string;
  repository?: {
    url: string;
    source: string;
  };
  icons?: Array<{
    src: string;
    mimeType?: string;
  }>;
  packages?: Array<{
    registryType: "npm" | "pypi" | "oci";
    identifier: string;
    runtimeHint?: string;
    transport: {
      type: "stdio" | "sse" | "streamable-http";
    };
  }>;
}

export interface RegistryServerWithMeta {
  server: RegistryServer;
  _meta: {
    "io.modelcontextprotocol.registry/official": {
      status: string;
      publishedAt: string;
      isLatest: boolean;
    };
  };
}

interface McpServerCardProps {
  server: RegistryServerWithMeta;
  onClick: () => void;
  className?: string;
}

export const McpServerCard: React.FC<McpServerCardProps> = ({
  server,
  onClick,
  className,
}) => {
  const { server: serverData, _meta } = server;
  const isVerified =
    _meta?.["io.modelcontextprotocol.registry/official"]?.status === "verified";

  // Get the first icon if available
  const iconSrc = serverData.icons?.[0]?.src;

  // Truncate description to ~100 characters
  const truncatedDescription =
    serverData.description && serverData.description.length > 100
      ? `${serverData.description.substring(0, 100)}...`
      : serverData.description;

  return (
    <Card
      className={cn(
        "hover:border-primary/50 transition-colors cursor-pointer h-full",
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${serverData.title || serverData.name}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header with icon and name */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt={`${serverData.name} icon`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide broken images and show fallback
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
              ) : null}
              <Server
                className={cn(
                  "h-5 w-5 text-muted-foreground",
                  iconSrc && "hidden",
                )}
              />
            </div>

            {/* Name and badges */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-sm truncate">
                  {serverData.title || serverData.name}
                </h3>
                {isVerified && (
                  <Badge
                    variant="secondary"
                    className="h-5 text-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                v{serverData.version}
              </p>
            </div>
          </div>

          {/* Description */}
          {truncatedDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {truncatedDescription}
            </p>
          )}

          {/* Package badges */}
          {serverData.packages && serverData.packages.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {serverData.packages.slice(0, 3).map((pkg, index) => (
                <Badge
                  key={`${pkg.registryType}-${index}`}
                  variant="outline"
                  className="h-5 text-xs"
                >
                  {pkg.registryType}
                </Badge>
              ))}
              {serverData.packages.length > 3 && (
                <Badge variant="outline" className="h-5 text-xs">
                  +{serverData.packages.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default McpServerCard;
