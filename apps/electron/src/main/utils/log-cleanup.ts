import fs from "fs";
import path from "path";
import { getLogDirectory, logger } from "./logger-factory";

const RETENTION_DAYS = 30;

export async function cleanupOldLogs(): Promise<void> {
  const logDir = getLogDirectory();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  try {
    const files = await fs.promises.readdir(logDir);

    for (const file of files) {
      if (!file.startsWith("mcp-router-") || !file.endsWith(".log")) {
        continue;
      }

      const filePath = path.join(logDir, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.mtime < cutoffDate) {
        await fs.promises.unlink(filePath);
        logger.info({ file }, "Deleted old log file");
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to cleanup old logs");
  }
}
