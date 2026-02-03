import { ipcMain } from "electron";
import { getMarketplaceService } from "./marketplace.service";
import {
  getSkillsRegistryService,
  type SkillsSearchOptions,
} from "./skills-registry.service";
import { getSkillService } from "../skills/skills.service";
import type { MarketplaceSearchOptions } from "./marketplace.types";

export function setupMarketplaceHandlers(): void {
  const service = getMarketplaceService();

  ipcMain.handle(
    "marketplace:search",
    async (_, options: MarketplaceSearchOptions) => {
      return service.searchServers(options);
    },
  );

  ipcMain.handle("marketplace:details", async (_, serverName: string) => {
    return service.getServerDetails(serverName);
  });

  ipcMain.handle("marketplace:readme", async (_, repoUrl: string) => {
    return service.fetchReadme(repoUrl);
  });

  ipcMain.handle("marketplace:clearCache", async () => {
    service.clearCache();
    return { success: true };
  });

  // Skills Registry Handlers
  const skillsRegistryService = getSkillsRegistryService();
  const skillService = getSkillService();

  ipcMain.handle(
    "marketplace:skills:search",
    async (_, options: SkillsSearchOptions) => {
      return skillsRegistryService.searchSkills(options);
    },
  );

  ipcMain.handle("marketplace:skills:details", async (_, skillName: string) => {
    return skillsRegistryService.getSkillDetails(skillName);
  });

  ipcMain.handle("marketplace:skills:content", async (_, repoUrl: string) => {
    return skillsRegistryService.fetchSkillMd(repoUrl);
  });

  ipcMain.handle(
    "marketplace:skills:install",
    async (
      _,
      options: { name: string; repoUrl: string; projectId?: string },
    ) => {
      // Fetch skill content from GitHub
      const content = await skillsRegistryService.fetchSkillMd(options.repoUrl);

      // Create the skill locally using SkillService
      const skill = skillService.create({
        name: options.name,
        projectId: options.projectId,
      });

      // Write the SKILL.md content (convert null to undefined for type compatibility)
      skillService.update(skill.id, { content: content ?? undefined });

      return skill;
    },
  );
}
