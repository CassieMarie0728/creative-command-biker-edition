import { users, toolkits, folders, assets, tags, type User, type InsertUser, type Toolkit, type InsertToolkit, type Folder, type InsertFolder, type Asset, type InsertAsset, type Tag, type InsertTag, type AssetWithDetails, type ToolkitWithFolders } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Toolkits
  getToolkits(userId: number): Promise<ToolkitWithFolders[]>;
  getToolkit(id: number): Promise<Toolkit | undefined>;
  createToolkit(toolkit: InsertToolkit): Promise<Toolkit>;
  updateToolkit(id: number, toolkit: Partial<InsertToolkit>): Promise<Toolkit | undefined>;
  deleteToolkit(id: number): Promise<boolean>;
  
  // Folders
  getFolders(toolkitId: number): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // Assets
  getAssets(toolkitId: number, folderId?: number): Promise<AssetWithDetails[]>;
  getAsset(id: number): Promise<AssetWithDetails | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  searchAssets(userId: number, query: string, filters?: { tags?: string[], fileType?: string }): Promise<AssetWithDetails[]>;
  
  // Tags
  getTags(userId: number): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private toolkits: Map<number, Toolkit> = new Map();
  private folders: Map<number, Folder> = new Map();
  private assets: Map<number, Asset> = new Map();
  private tags: Map<number, Tag> = new Map();
  private currentUserId = 1;
  private currentToolkitId = 1;
  private currentFolderId = 1;
  private currentAssetId = 1;
  private currentTagId = 1;

  constructor() {
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "hashed_password",
      role: "road_captain"
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || "prospect",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Toolkits
  async getToolkits(userId: number): Promise<ToolkitWithFolders[]> {
    const userToolkits = Array.from(this.toolkits.values()).filter(toolkit => toolkit.userId === userId);
    return userToolkits.map(toolkit => {
      const folders = Array.from(this.folders.values()).filter(folder => folder.toolkitId === toolkit.id);
      const assetCount = Array.from(this.assets.values()).filter(asset => asset.toolkitId === toolkit.id).length;
      return {
        ...toolkit,
        folders,
        assetCount
      };
    });
  }

  async getToolkit(id: number): Promise<Toolkit | undefined> {
    return this.toolkits.get(id);
  }

  async createToolkit(insertToolkit: InsertToolkit): Promise<Toolkit> {
    const id = this.currentToolkitId++;
    const toolkit: Toolkit = {
      ...insertToolkit,
      description: insertToolkit.description || null,
      id,
      createdAt: new Date(),
    };
    this.toolkits.set(id, toolkit);
    return toolkit;
  }

  async updateToolkit(id: number, toolkit: Partial<InsertToolkit>): Promise<Toolkit | undefined> {
    const existing = this.toolkits.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...toolkit };
    this.toolkits.set(id, updated);
    return updated;
  }

  async deleteToolkit(id: number): Promise<boolean> {
    return this.toolkits.delete(id);
  }

  // Folders
  async getFolders(toolkitId: number): Promise<Folder[]> {
    return Array.from(this.folders.values()).filter(folder => folder.toolkitId === toolkitId);
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const folder: Folder = {
      ...insertFolder,
      parentId: insertFolder.parentId || null,
      id,
      createdAt: new Date(),
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined> {
    const existing = this.folders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...folder };
    this.folders.set(id, updated);
    return updated;
  }

  async deleteFolder(id: number): Promise<boolean> {
    return this.folders.delete(id);
  }

  // Assets
  async getAssets(toolkitId: number, folderId?: number): Promise<AssetWithDetails[]> {
    const assetList = Array.from(this.assets.values()).filter(asset => {
      if (asset.toolkitId !== toolkitId) return false;
      if (folderId !== undefined && asset.folderId !== folderId) return false;
      return true;
    });

    return assetList.map(asset => {
      const toolkit = this.toolkits.get(asset.toolkitId)!;
      const folder = asset.folderId ? this.folders.get(asset.folderId) : undefined;
      const user = this.users.get(asset.userId)!;
      return {
        ...asset,
        toolkit,
        folder,
        user
      };
    });
  }

  async getAsset(id: number): Promise<AssetWithDetails | undefined> {
    const asset = this.assets.get(id);
    if (!asset) return undefined;

    const toolkit = this.toolkits.get(asset.toolkitId)!;
    const folder = asset.folderId ? this.folders.get(asset.folderId) : undefined;
    const user = this.users.get(asset.userId)!;
    
    return {
      ...asset,
      toolkit,
      folder,
      user
    };
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentAssetId++;
    const now = new Date();
    const asset: Asset = {
      ...insertAsset,
      status: insertAsset.status || null,
      metadata: insertAsset.metadata || null,
      tags: insertAsset.tags || [],
      width: insertAsset.width || null,
      height: insertAsset.height || null,
      duration: insertAsset.duration || null,
      thumbnailPath: insertAsset.thumbnailPath || null,
      folderId: insertAsset.folderId || null,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset | undefined> {
    const existing = this.assets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...asset, updatedAt: new Date() };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  async searchAssets(userId: number, query: string, filters?: { tags?: string[], fileType?: string }): Promise<AssetWithDetails[]> {
    const userAssets = Array.from(this.assets.values()).filter(asset => asset.userId === userId);
    
    let filtered = userAssets.filter(asset => {
      const assetTags = asset.tags || [];
      const matchesQuery = asset.name.toLowerCase().includes(query.toLowerCase()) ||
                          asset.originalName.toLowerCase().includes(query.toLowerCase()) ||
                          assetTags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      if (!matchesQuery) return false;
      
      if (filters?.fileType && asset.fileType !== filters.fileType) return false;
      
      if (filters?.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => assetTags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });

    return filtered.map(asset => {
      const toolkit = this.toolkits.get(asset.toolkitId)!;
      const folder = asset.folderId ? this.folders.get(asset.folderId) : undefined;
      const user = this.users.get(asset.userId)!;
      return {
        ...asset,
        toolkit,
        folder,
        user
      };
    });
  }

  // Tags
  async getTags(userId: number): Promise<Tag[]> {
    return Array.from(this.tags.values()).filter(tag => tag.userId === userId);
  }

  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.currentTagId++;
    const tag: Tag = {
      ...insertTag,
      color: insertTag.color || "#6b7280",
      id,
      createdAt: new Date(),
    };
    this.tags.set(id, tag);
    return tag;
  }

  async updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const existing = this.tags.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...tag };
    this.tags.set(id, updated);
    return updated;
  }

  async deleteTag(id: number): Promise<boolean> {
    return this.tags.delete(id);
  }
}

export const storage = new MemStorage();
