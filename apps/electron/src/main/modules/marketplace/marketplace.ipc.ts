import { ipcMain } from "electron";
import { getMarketplaceService } from "./marketplace.service";
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
}
