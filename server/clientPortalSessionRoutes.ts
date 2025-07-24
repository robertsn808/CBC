// ✅ Express routes for client portal session admin endpoints
import type { Express } from "express";
import { storage } from "./src/storage";

export function registerClientPortalSessionRoutes(app: Express) {
  // Get all sessions
  app.get("/api/admin/client-portal-sessions", async (req, res) => {
    try {
      const sessions = await storage.getClientPortalSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching portal sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get one session by token
  app.get("/api/admin/client-portal-sessions/:token", async (req, res) => {
    try {
      const sessions = await storage.getClientPortalSessions();
      const session = sessions.find(s => s.sessionToken === req.params.token);
      if (!session) return res.status(404).json({ error: "Session not found" });
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Create new session
  app.post("/api/admin/client-portal-sessions", async (req, res) => {
    try {
      const session = await storage.createClientPortalSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Update a session by token
  app.patch("/api/admin/client-portal-sessions/:token", async (req, res) => {
    try {
      const updated = await storage.updateClientPortalSession(req.params.token, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete a session by token
  app.delete("/api/admin/client-portal-sessions/:token", async (req, res) => {
    try {
      await storage.deleteClientPortalSession(req.params.token);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });
}
