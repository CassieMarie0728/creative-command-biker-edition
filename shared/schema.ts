import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("prospect"), // road_captain, wrench, prospect
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const toolkits = pgTable("toolkits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  toolkitId: integer("toolkit_id").notNull(),
  parentId: integer("parent_id"), // for nested folders
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // image, audio, video, pdf, vector
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // in bytes
  width: integer("width"), // for images/videos
  height: integer("height"), // for images/videos
  duration: integer("duration"), // for audio/video in seconds
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  folderId: integer("folder_id"),
  toolkitId: integer("toolkit_id").notNull(),
  userId: integer("user_id").notNull(),
  tags: text("tags").array().default([]),
  status: text("status").default(""), // HELL YEAH, IN THE WIND, NEEDS FIXIN, etc.
  metadata: jsonb("metadata"), // additional file metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6b7280"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertToolkitSchema = createInsertSchema(toolkits).omit({
  id: true,
  createdAt: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Toolkit = typeof toolkits.$inferSelect;
export type InsertToolkit = z.infer<typeof insertToolkitSchema>;

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

// Extended types for frontend
export type AssetWithDetails = Asset & {
  toolkit: Toolkit;
  folder?: Folder;
  user: User;
};

export type ToolkitWithFolders = Toolkit & {
  folders: Folder[];
  assetCount: number;
};
