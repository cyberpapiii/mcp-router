import { ipcMain } from "electron";
import { getCloudSyncService } from "./cloud-sync.service";

export function setupCloudSyncHandlers(): void {
  ipcMain.handle("cloud-sync:status", () => getCloudSyncService().getStatus());
  ipcMain.handle("cloud-sync:set-enabled", (_event, enabled: boolean) =>
    getCloudSyncService().setEnabled(enabled),
  );
  ipcMain.handle("cloud-sync:set-passphrase", (_event, passphrase: string) =>
    getCloudSyncService().setPassphrase(passphrase),
  );
  ipcMain.handle("cloud-sync:sync-now", async () => {
    await getCloudSyncService().syncNow();
    return getCloudSyncService().getStatus();
  });
}
