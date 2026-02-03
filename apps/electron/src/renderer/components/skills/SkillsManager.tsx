import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Badge,
  TooltipProvider,
  ScrollArea,
} from "@mcp_router/ui";
import {
  IconDownload,
  IconFolderOpen,
  IconPlus,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react";
import { usePlatformAPI } from "@/renderer/platform-api";
import type {
  Skill,
  DiscoveredSkill,
  UnifiedSkill,
  ClientApp,
  ClientSkillSummary,
} from "@mcp_router/shared";
import { toast } from "sonner";
import { cn } from "@/renderer/utils/tailwind-utils";
import { UnifiedSkillCard } from "./UnifiedSkillCard";
import UnifiedSkillDetailSheet from "./UnifiedSkillDetailSheet";
import { ErrorBoundary } from "@/renderer/components/common/ErrorBoundary";

/**
 * Transforms local skills and discovered skills into unified skills format.
 * This is a temporary solution until the backend UnifiedSkillsService is implemented.
 *
 * Note: Content is loaded lazily when the skill detail sheet opens, not during list
 */
function transformToUnifiedSkills(
  localSkills: Skill[],
  discoveredSkills: DiscoveredSkill[],
  clientApps: ClientApp[],
): UnifiedSkill[] {
  const unifiedMap = new Map<string, UnifiedSkill>();

  // Create client states template for all clients
  const createClientStates = (): ClientSkillSummary[] =>
    clientApps.map((client) => ({
      clientId: client.id,
      clientName: client.name,
      clientIcon: client.icon,
      state: "not-installed" as const,
      isManaged: false,
      symlinkStatus: "none" as const,
    }));

  // Process local skills first
  for (const skill of localSkills) {
    const clientStates = createClientStates();

    // Mark as enabled in all clients if the skill is globally enabled
    if (skill.enabled) {
      for (const cs of clientStates) {
        cs.state = "enabled";
        cs.isManaged = true;
        cs.symlinkStatus = "active";
      }
    }

    unifiedMap.set(skill.name, {
      id: skill.id,
      name: skill.name,
      content: null, // Content is loaded lazily when detail sheet opens
      source: "local",
      clientStates,
      globalSync: skill.enabled,
      projectId: skill.projectId,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    });
  }

  // Process discovered skills
  for (const discovered of discoveredSkills) {
    const existing = unifiedMap.get(discovered.skillName);

    if (existing) {
      // Update the client state for this discovered skill
      let clientState = existing.clientStates.find(
        (cs) => cs.clientId === discovered.sourceClientId,
      );

      // If client not in list (not installed), add it dynamically
      if (!clientState) {
        clientState = {
          clientId: discovered.sourceClientId,
          clientName: discovered.sourceClientName,
          clientIcon: undefined, // No icon for uninstalled clients
          state: "not-installed" as const,
          isManaged: false,
          symlinkStatus: "none" as const,
        };
        existing.clientStates.push(clientState);
      }

      clientState.state = "enabled";
      clientState.isManaged = discovered.isSymlink;
      clientState.symlinkStatus = discovered.isSymlink ? "active" : "none";

      // Also update sourcePath if this is a discovered skill without one
      if (!existing.sourcePath && existing.source === "discovered") {
        existing.sourcePath = discovered.skillPath;
      }
    } else {
      // Create new unified skill from discovered
      const clientStates = createClientStates();
      let clientState = clientStates.find(
        (cs) => cs.clientId === discovered.sourceClientId,
      );

      // If client not in list (not installed), add it dynamically
      if (!clientState) {
        clientState = {
          clientId: discovered.sourceClientId,
          clientName: discovered.sourceClientName,
          clientIcon: undefined, // No icon for uninstalled clients
          state: "not-installed" as const,
          isManaged: false,
          symlinkStatus: "none" as const,
        };
        clientStates.push(clientState);
      }

      clientState.state = "enabled";
      clientState.isManaged = discovered.isSymlink;
      clientState.symlinkStatus = discovered.isSymlink ? "active" : "none";

      unifiedMap.set(discovered.skillName, {
        id: `discovered-${discovered.sourceClientId}-${discovered.skillName}`,
        name: discovered.skillName,
        content: null, // Content loaded lazily when detail sheet opens
        source: "discovered",
        originClientId: discovered.sourceClientId,
        sourcePath: discovered.skillPath, // Store path for content loading
        clientStates,
        globalSync: false,
        projectId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  // Convert map to array and sort by name
  return Array.from(unifiedMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

const SkillsManager: React.FC = () => {
  const { t } = useTranslation();
  const platformAPI = usePlatformAPI();

  // Data state
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [discoveredSkills, setDiscoveredSkills] = useState<DiscoveredSkill[]>(
    [],
  );
  const [clientApps, setClientApps] = useState<ClientApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedSkill, setSelectedSkill] = useState<UnifiedSkill | null>(null);

  // New skill dialog state
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }

      try {
        const [skillsList, discovered, clients] = await Promise.all([
          platformAPI.skills.list(),
          platformAPI.clientApps.discoverSkillsFromClients(),
          platformAPI.clientApps.list(),
        ]);

        setLocalSkills(skillsList);
        setDiscoveredSkills(discovered);
        setClientApps(clients);
      } catch (error) {
        console.error("Failed to load skills data:", error);
        toast.error(t("skills.loadError"));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [platformAPI, t],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Transform to unified skills
  const unifiedSkills = useMemo(
    () => transformToUnifiedSkills(localSkills, discoveredSkills, clientApps),
    [localSkills, discoveredSkills, clientApps],
  );

  // Filter skills by search query and selected clients
  const filteredSkills = useMemo(() => {
    let filtered = unifiedSkills;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((skill) =>
        skill.name.toLowerCase().includes(query),
      );
    }

    // Filter by selected clients
    if (selectedClientIds.size > 0) {
      filtered = filtered.filter((skill) =>
        skill.clientStates.some(
          (cs) =>
            selectedClientIds.has(cs.clientId) && cs.state !== "not-installed",
        ),
      );
    }

    return filtered;
  }, [unifiedSkills, searchQuery, selectedClientIds]);

  // Client filter toggle
  const handleClientFilterToggle = (clientId: string) => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  // Clear all client filters
  const handleClearClientFilters = () => {
    setSelectedClientIds(new Set());
  };

  // Create new skill
  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) {
      setDialogError(t("skills.nameRequired"));
      return;
    }

    setDialogError(null);
    try {
      await platformAPI.skills.create({
        name: newSkillName.trim(),
      });
      toast.success(t("skills.createSuccess"));
      setIsNewDialogOpen(false);
      setNewSkillName("");
      await loadData();
    } catch (error: any) {
      setDialogError(error.message || t("skills.createError"));
    }
  };

  const handleCloseNewDialog = () => {
    setIsNewDialogOpen(false);
    setNewSkillName("");
    setDialogError(null);
  };

  // Import skill
  const handleImport = async () => {
    try {
      await platformAPI.skills.import();
      toast.success(t("skills.importSuccess"));
      await loadData();
    } catch (error: any) {
      if (error.message !== "No folder selected") {
        toast.error(error.message || t("skills.importError"));
      }
    }
  };

  // Open skills folder
  const handleOpenSkillsFolder = async () => {
    try {
      await platformAPI.skills.openFolder();
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadData(true);
  };

  // Handle skill selection
  const handleSkillClick = (skill: UnifiedSkill) => {
    setSelectedSkill(skill);
  };

  // Handle detail sheet close
  const handleDetailClose = () => {
    setSelectedSkill(null);
  };

  // Handle skill update (refresh data)
  const handleSkillUpdate = () => {
    loadData(true);
  };

  // Update selected skill when unifiedSkills changes (fixes stale state after loadData)
  useEffect(() => {
    if (selectedSkill) {
      const updated = unifiedSkills.find((s) => s.id === selectedSkill.id);
      if (updated) {
        setSelectedSkill(updated);
      }
    }
  }, [unifiedSkills, selectedSkill]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col gap-4 p-4 border-b">
            {/* Top row: Title, Search, and Actions */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold shrink-0">
                {t("skills.unified.title", { defaultValue: "Skills Library" })}
              </h2>

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("skills.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label={t("skills.searchPlaceholder")}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button onClick={() => setIsNewDialogOpen(true)}>
                  <IconPlus className="w-4 h-4 mr-2" />
                  {t("skills.new")}
                </Button>
              </div>
            </div>

            {/* Bottom row: Client filters and secondary actions */}
            <div className="flex items-center justify-between gap-4">
              {/* Client Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {t("skills.unified.filter", { defaultValue: "Filter:" })}
                </span>
                <Badge
                  variant={selectedClientIds.size === 0 ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedClientIds.size === 0 &&
                      "bg-primary text-primary-foreground",
                  )}
                  onClick={handleClearClientFilters}
                >
                  {t("skills.unified.all", { defaultValue: "All" })}
                </Badge>
                {clientApps.map((client) => (
                  <Badge
                    key={client.id}
                    variant={
                      selectedClientIds.has(client.id) ? "default" : "outline"
                    }
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedClientIds.has(client.id) &&
                        "bg-primary text-primary-foreground",
                    )}
                    onClick={() => handleClientFilterToggle(client.id)}
                  >
                    {client.name}
                  </Badge>
                ))}
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <IconRefresh
                    className={cn(
                      "w-4 h-4 mr-2",
                      isRefreshing && "animate-spin",
                    )}
                  />
                  {t("common.refresh")}
                </Button>
                <Button variant="outline" size="sm" onClick={handleImport}>
                  <IconDownload className="w-4 h-4 mr-2" />
                  {t("skills.import")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSkillsFolder}
                >
                  <IconFolderOpen className="w-4 h-4 mr-2" />
                  {t("skills.openFolder")}
                </Button>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {filteredSkills.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  {searchQuery || selectedClientIds.size > 0
                    ? t("skills.noResults")
                    : t("skills.empty")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSkills.map((skill) => (
                    <UnifiedSkillCard
                      key={skill.id}
                      skill={skill}
                      onClick={() => handleSkillClick(skill)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Skill Detail Sheet */}
          <UnifiedSkillDetailSheet
            skill={selectedSkill}
            isOpen={!!selectedSkill}
            onClose={handleDetailClose}
            onUpdate={handleSkillUpdate}
          />

          {/* New Skill Dialog */}
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("skills.newDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("skills.newDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="skill-name">{t("skills.name")}</Label>
                  <Input
                    id="skill-name"
                    value={newSkillName}
                    onChange={(e) => {
                      setNewSkillName(e.target.value);
                      setDialogError(null);
                    }}
                    placeholder={t("skills.namePlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateSkill();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("skills.nameHint")}
                  </p>
                  {dialogError && (
                    <p className="text-xs text-destructive">{dialogError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseNewDialog}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleCreateSkill}>
                  {t("skills.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default SkillsManager;
