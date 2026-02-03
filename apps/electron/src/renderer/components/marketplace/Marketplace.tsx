import React, { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@mcp_router/ui";

// Import actual components
import { McpServerGrid } from "./mcp-servers";
import { SkillsGrid } from "./skills";
import { MarketplaceSearch } from "./shared";

type MarketplaceTab = "servers" | "skills";

const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL, default to "servers"
  const activeTab = (searchParams.get("tab") as MarketplaceTab) || "servers";
  const searchQuery = searchParams.get("q") || "";

  // Handle tab change - update URL
  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("tab", value);
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Handle search query change - update URL
  const handleSearchChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set("q", value);
      } else {
        newParams.delete("q");
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">{t("marketplace.title")}</h1>
        <MarketplaceSearch
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={t("marketplace.searchPlaceholder")}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <div className="px-4 pt-4">
          <TabsList>
            <TabsTrigger value="servers">
              {t("marketplace.tabs.servers")}
            </TabsTrigger>
            <TabsTrigger value="skills">
              {t("marketplace.tabs.skills")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <TabsContent value="servers" className="flex-1 overflow-auto p-4">
          <McpServerGrid searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="skills" className="flex-1 overflow-auto p-4">
          <SkillsGrid searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;
