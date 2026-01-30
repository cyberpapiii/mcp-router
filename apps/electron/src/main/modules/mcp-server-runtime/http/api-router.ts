import { Router, Request, Response } from "express";
import type { MCPServerManager } from "../../mcp-server-manager/mcp-server-manager";

export function createApiRouter(serverManager: MCPServerManager): Router {
  const router = Router();

  // GET /api/health - Health check endpoint
  router.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.0.0",
    });
  });

  // GET /api/servers - List all MCP servers
  router.get("/servers", (_req: Request, res: Response) => {
    try {
      const servers = serverManager.getServers();
      res.json({ servers });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to list servers",
      });
    }
  });

  // POST /api/servers/:id/start - Start a server
  router.post("/servers/:id/start", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await serverManager.startServer(id, "REST API");
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to start server",
      });
    }
  });

  // POST /api/servers/:id/stop - Stop a server
  router.post("/servers/:id/stop", (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = serverManager.stopServer(id, "REST API");
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to stop server",
      });
    }
  });

  // GET /api/servers/:id/tools - List server tools
  router.get("/servers/:id/tools", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const tools = await serverManager.listServerTools(id);
      res.json({ tools });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to list tools",
      });
    }
  });

  return router;
}
