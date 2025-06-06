import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { ToolkitWithFolders } from "@shared/schema";

interface SidebarProps {
  toolkits: ToolkitWithFolders[];
  selectedToolkitId: number | null;
  selectedFolderId: number | null;
  onSelectToolkit: (id: number) => void;
  onSelectFolder: (id: number | null) => void;
}

export function Sidebar({
  toolkits,
  selectedToolkitId,
  selectedFolderId,
  onSelectToolkit,
  onSelectFolder,
}: SidebarProps) {
  const [expandedToolkits, setExpandedToolkits] = useState<Set<number>>(new Set());
  const [newToolkitName, setNewToolkitName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateToolkitOpen, setIsCreateToolkitOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createToolkitMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/toolkits", { name, userId: 1 });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      setNewToolkitName("");
      setIsCreateToolkitOpen(false);
      toast({
        title: "TOOLKIT CREATED",
        description: "New toolkit ready for action",
      });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: { name: string; toolkitId: number }) => {
      const response = await apiRequest("POST", "/api/folders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      toast({
        title: "FOLDER CREATED",
        description: "New drawer ready for parts",
      });
    },
  });

  const toggleToolkitExpansion = (toolkitId: number) => {
    const newExpanded = new Set(expandedToolkits);
    if (newExpanded.has(toolkitId)) {
      newExpanded.delete(toolkitId);
    } else {
      newExpanded.add(toolkitId);
    }
    setExpandedToolkits(newExpanded);
  };

  const handleToolkitSelect = (toolkitId: number) => {
    onSelectToolkit(toolkitId);
    onSelectFolder(null);
    if (!expandedToolkits.has(toolkitId)) {
      toggleToolkitExpansion(toolkitId);
    }
  };

  // Calculate total stats
  const totalAssets = toolkits.reduce((sum, toolkit) => sum + toolkit.assetCount, 0);
  const totalProjects = toolkits.length;

  return (
    <aside className="w-80 bg-card border-r border-border shadow-lg overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <i className="fas fa-skull text-2xl text-primary mr-3"></i>
          <div>
            <h1 className="font-orbitron font-bold text-xl tracking-wider text-foreground">
              CREATIVE COMMAND
            </h1>
            <span className="text-sm text-muted-foreground">BIKER EDITION</span>
          </div>
        </div>

        {/* Garage Status Panel */}
        <div className="bg-background border border-border rounded-lg p-4 mb-6 shadow-inner">
          <h3 className="font-bold text-sm tracking-wider text-foreground mb-3 uppercase">
            <i className="fas fa-warehouse mr-2 text-accent"></i>Garage Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Assets:</span>
              <span className="font-bold text-foreground">{totalAssets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Projects:</span>
              <span className="font-bold text-foreground">{totalProjects}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="font-bold text-sm tracking-wider text-foreground mb-3 uppercase">
            <i className="fas fa-bolt mr-2 text-primary"></i>Quick Actions
          </h3>
          <div className="space-y-2">
            <Dialog open={isCreateToolkitOpen} onOpenChange={setIsCreateToolkitOpen}>
              <DialogTrigger asChild>
                <Button className="w-full metal-button justify-start" variant="outline">
                  <i className="fas fa-plus mr-2 text-accent"></i>NEW TOOLKIT
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>CREATE NEW TOOLKIT</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Toolkit name"
                    value={newToolkitName}
                    onChange={(e) => setNewToolkitName(e.target.value)}
                    className="bg-background border-border"
                  />
                  <Button
                    onClick={() => createToolkitMutation.mutate(newToolkitName)}
                    disabled={!newToolkitName.trim() || createToolkitMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {createToolkitMutation.isPending ? "CREATING..." : "CREATE TOOLKIT"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {selectedToolkitId && (
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full metal-button justify-start" variant="outline">
                    <i className="fas fa-folder-plus mr-2 text-accent"></i>NEW DRAWER
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>CREATE NEW DRAWER</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Drawer name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="bg-background border-border"
                    />
                    <Button
                      onClick={() => createFolderMutation.mutate({ 
                        name: newFolderName, 
                        toolkitId: selectedToolkitId 
                      })}
                      disabled={!newFolderName.trim() || createFolderMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {createFolderMutation.isPending ? "CREATING..." : "CREATE DRAWER"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Garage Structure (Folder Tree) */}
        <div>
          <h3 className="font-bold text-sm tracking-wider text-foreground mb-3 uppercase">
            <i className="fas fa-sitemap mr-2 text-muted-foreground"></i>Garage Structure
          </h3>
          
          {toolkits.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-toolbox text-4xl text-muted-foreground mb-2"></i>
              <p className="text-sm text-muted-foreground">No toolkits yet</p>
              <p className="text-xs text-muted-foreground">Create your first toolkit to get started</p>
            </div>
          ) : (
            <div className="space-y-1">
              {toolkits.map((toolkit) => {
                const isExpanded = expandedToolkits.has(toolkit.id);
                const isSelected = selectedToolkitId === toolkit.id;
                
                return (
                  <div key={toolkit.id} className="folder-item">
                    <button
                      onClick={() => handleToolkitSelect(toolkit.id)}
                      className={`w-full flex items-center p-2 rounded hover:bg-muted/20 text-left group transition-colors ${
                        isSelected ? 'bg-primary/20 text-primary' : ''
                      }`}
                    >
                      <i 
                        className={`fas mr-2 text-xs transition-transform ${
                          isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'
                        } ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                      />
                      <i className={`fas fa-toolbox mr-2 ${
                        isSelected ? 'text-primary' : 'text-accent'
                      }`} />
                      <span className="font-semibold text-sm uppercase tracking-wide truncate">
                        {toolkit.name}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {toolkit.assetCount} parts
                      </span>
                    </button>
                    
                    {isExpanded && toolkit.folders.length > 0 && (
                      <div className="ml-6 space-y-1">
                        <button
                          onClick={() => onSelectFolder(null)}
                          className={`w-full flex items-center p-2 rounded hover:bg-muted/10 text-left ${
                            selectedFolderId === null && isSelected ? 'bg-accent/20 text-accent' : ''
                          }`}
                        >
                          <i className="fas fa-folder mr-2 text-muted-foreground" />
                          <span className="text-sm">All Assets</span>
                        </button>
                        
                        {toolkit.folders.map((folder) => {
                          const isFolderSelected = selectedFolderId === folder.id;
                          
                          return (
                            <button
                              key={folder.id}
                              onClick={() => onSelectFolder(folder.id)}
                              className={`w-full flex items-center p-2 rounded hover:bg-muted/10 text-left ${
                                isFolderSelected ? 'bg-accent/20 text-accent' : ''
                              }`}
                            >
                              <i className="fas fa-folder mr-2 text-muted-foreground" />
                              <span className="text-sm">{folder.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
