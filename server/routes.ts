import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertToolkitSchema, insertFolderSchema, insertAssetSchema, insertTagSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock session middleware - in production this would be handled by authentication
  app.use((req, res, next) => {
    // Mock authenticated user for development
    (req as any).user = { id: 1, role: "road_captain" };
    next();
  });

  // Toolkits
  app.get("/api/toolkits", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const toolkits = await storage.getToolkits(userId);
      res.json(toolkits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch toolkits" });
    }
  });

  app.post("/api/toolkits", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const data = insertToolkitSchema.parse({ ...req.body, userId });
      const toolkit = await storage.createToolkit(data);
      res.json(toolkit);
    } catch (error) {
      res.status(400).json({ message: "Failed to create toolkit" });
    }
  });

  app.put("/api/toolkits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertToolkitSchema.partial().parse(req.body);
      const toolkit = await storage.updateToolkit(id, data);
      if (!toolkit) {
        return res.status(404).json({ message: "Toolkit not found" });
      }
      res.json(toolkit);
    } catch (error) {
      res.status(400).json({ message: "Failed to update toolkit" });
    }
  });

  app.delete("/api/toolkits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteToolkit(id);
      if (!deleted) {
        return res.status(404).json({ message: "Toolkit not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete toolkit" });
    }
  });

  // Folders
  app.get("/api/toolkits/:toolkitId/folders", async (req, res) => {
    try {
      const toolkitId = parseInt(req.params.toolkitId);
      const folders = await storage.getFolders(toolkitId);
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.post("/api/folders", async (req, res) => {
    try {
      const data = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(data);
      res.json(folder);
    } catch (error) {
      res.status(400).json({ message: "Failed to create folder" });
    }
  });

  app.put("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertFolderSchema.partial().parse(req.body);
      const folder = await storage.updateFolder(id, data);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      res.status(400).json({ message: "Failed to update folder" });
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFolder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // Assets
  app.get("/api/toolkits/:toolkitId/assets", async (req, res) => {
    try {
      const toolkitId = parseInt(req.params.toolkitId);
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
      const assets = await storage.getAssets(toolkitId, folderId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = (req as any).user.id;
      const { toolkitId, folderId, tags = [], status = "" } = req.body;

      // Determine file type based on mime type
      let fileType = "other";
      if (req.file.mimetype.startsWith("image/")) fileType = "image";
      else if (req.file.mimetype.startsWith("audio/")) fileType = "audio";
      else if (req.file.mimetype.startsWith("video/")) fileType = "video";
      else if (req.file.mimetype === "application/pdf") fileType = "pdf";
      else if (req.file.mimetype.includes("svg")) fileType = "vector";

      const assetData = {
        name: req.file.originalname,
        originalName: req.file.originalname,
        fileType,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filePath: req.file.path,
        toolkitId: parseInt(toolkitId),
        folderId: folderId ? parseInt(folderId) : null,
        userId,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        status,
        width: null,
        height: null,
        duration: null,
        thumbnailPath: null,
        metadata: null,
      };

      const asset = await storage.createAsset(assetData);
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.put("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertAssetSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(id, data);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(400).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const asset = await storage.getAsset(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      // Delete file from filesystem
      if (fs.existsSync(asset.filePath)) {
        fs.unlinkSync(asset.filePath);
      }
      if (asset.thumbnailPath && fs.existsSync(asset.thumbnailPath)) {
        fs.unlinkSync(asset.thumbnailPath);
      }

      const deleted = await storage.deleteAsset(id);
      if (!deleted) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Bulk asset operations
  app.post("/api/assets/bulk", async (req, res) => {
    try {
      const { action, assetIds, data } = req.body;
      const results = [];

      for (const id of assetIds) {
        if (action === "delete") {
          const asset = await storage.getAsset(id);
          if (asset && fs.existsSync(asset.filePath)) {
            fs.unlinkSync(asset.filePath);
          }
          await storage.deleteAsset(id);
        } else if (action === "update") {
          const updated = await storage.updateAsset(id, data);
          results.push(updated);
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ message: "Failed to perform bulk operation" });
    }
  });

  // Search assets
  app.get("/api/assets/search", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const query = req.query.q as string || "";
      const tags = req.query.tags ? (req.query.tags as string).split(",") : undefined;
      const fileType = req.query.fileType as string || undefined;

      const assets = await storage.searchAssets(userId, query, { tags, fileType });
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to search assets" });
    }
  });

  // Tags
  app.get("/api/tags", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const tags = await storage.getTags(userId);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const data = insertTagSchema.parse({ ...req.body, userId });
      const tag = await storage.createTag(data);
      res.json(tag);
    } catch (error) {
      res.status(400).json({ message: "Failed to create tag" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  const httpServer = createServer(app);
  return httpServer;
}
