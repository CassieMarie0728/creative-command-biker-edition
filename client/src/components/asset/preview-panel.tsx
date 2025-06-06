import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AssetWithDetails } from "@shared/schema";

interface PreviewPanelProps {
  asset: AssetWithDetails;
  onClose: () => void;
  onUpdate: () => void;
}

export function PreviewPanel({ asset, onClose, onUpdate }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [newTag, setNewTag] = useState("");
  const [imageError, setImageError] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAssetMutation = useMutation({
    mutationFn: async (data: Partial<AssetWithDetails>) => {
      const response = await apiRequest("PUT", `/api/assets/${asset.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assets', asset.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      onUpdate();
      toast({
        title: "ASSET UPDATED",
        description: "Changes saved successfully",
      });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/assets/${asset.id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      onUpdate();
      onClose();
      toast({
        title: "ASSET DELETED",
        description: "File eliminated from garage",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleStatusChange = (status: string) => {
    updateAssetMutation.mutate({ status });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !asset.tags.includes(newTag.trim())) {
      const updatedTags = [...asset.tags, newTag.trim()];
      updateAssetMutation.mutate({ tags: updatedTags });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = asset.tags.filter(tag => tag !== tagToRemove);
    updateAssetMutation.mutate({ tags: updatedTags });
  };

  const handleDelete = () => {
    if (confirm(`DELETE ${asset.name}? This action cannot be undone.`)) {
      deleteAssetMutation.mutate();
    }
  };

  const renderPreview = () => {
    if (asset.fileType === 'image' && !imageError) {
      return (
        <img
          src={`/uploads/${asset.filePath.split('/').pop()}`}
          alt={asset.name}
          className="w-full rounded transition-transform"
          style={{ transform: `scale(${zoom / 100})` }}
          onError={() => setImageError(true)}
        />
      );
    }

    if (asset.fileType === 'video') {
      return (
        <video
          src={`/uploads/${asset.filePath.split('/').pop()}`}
          controls
          className="w-full rounded"
          style={{ transform: `scale(${zoom / 100})` }}
        />
      );
    }

    if (asset.fileType === 'audio') {
      return (
        <div className="w-full p-8 bg-gradient-to-br from-muted to-background rounded flex flex-col items-center justify-center">
          <i className="fas fa-music text-6xl text-muted-foreground mb-4" />
          <audio
            src={`/uploads/${asset.filePath.split('/').pop()}`}
            controls
            className="w-full"
          />
        </div>
      );
    }

    const getFileIcon = () => {
      switch (asset.fileType) {
        case 'pdf': return 'fa-file-pdf text-red-500';
        case 'vector': return 'fa-vector-square text-yellow-500';
        default: return 'fa-file text-muted-foreground';
      }
    };

    return (
      <div className="w-full p-8 bg-gradient-to-br from-muted to-background rounded flex items-center justify-center">
        <i className={`fas ${getFileIcon()} text-6xl`} />
      </div>
    );
  };

  return (
    <aside className="w-80 bg-card border-l border-border overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg tracking-wider text-foreground">
            ASSET INTEL
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <i className="fas fa-times" />
          </Button>
        </div>

        {/* Preview Area */}
        <div className="bg-background border border-border rounded-lg p-4 mb-6 overflow-hidden">
          {renderPreview()}
          
          {/* Zoom Controls */}
          {(asset.fileType === 'image' || asset.fileType === 'video') && (
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                disabled={zoom <= 25}
                className="metal-button"
              >
                <i className="fas fa-search-minus" />
              </Button>
              <span className="text-sm text-muted-foreground">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
                className="metal-button"
              >
                <i className="fas fa-search-plus" />
              </Button>
            </div>
          )}
        </div>

        {/* Asset Metadata */}
        <div className="space-y-4">
          {/* File Details */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 uppercase tracking-wide">
              File Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="text-foreground font-mono text-xs truncate ml-2">
                  {asset.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="text-foreground">{formatFileSize(asset.size)}</span>
              </div>
              {asset.width && asset.height && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="text-foreground">{asset.width} × {asset.height}</span>
                </div>
              )}
              {asset.duration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="text-foreground">
                    {Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="text-foreground uppercase">{asset.fileType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="text-foreground">{formatDate(asset.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Status & Tags */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 uppercase tracking-wide">
              Status & Tags
            </h4>
            
            {/* Status Selector */}
            <div className="mb-3">
              <Select value={asset.status || ""} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Set status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Status</SelectItem>
                  <SelectItem value="HELL YEAH">HELL YEAH</SelectItem>
                  <SelectItem value="IN THE WIND">IN THE WIND</SelectItem>
                  <SelectItem value="NEEDS FIXIN">NEEDS FIXIN</SelectItem>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="mb-3">
              {asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {asset.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="group">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 h-auto p-0 hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times text-xs" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="bg-background border-border text-sm"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  size="sm"
                  className="metal-button"
                >
                  <i className="fas fa-plus" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-bold text-sm text-foreground mb-2 uppercase tracking-wide">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Button
                className="w-full justify-start metal-button"
                variant="outline"
                onClick={() => window.open(`/uploads/${asset.filePath.split('/').pop()}`, '_blank')}
              >
                <i className="fas fa-download mr-2 text-foreground" />
                DOWNLOAD
              </Button>
              <Button
                className="w-full justify-start metal-button"
                variant="outline"
                onClick={() => {
                  // TODO: Implement duplicate functionality
                  toast({ title: "FEATURE COMING", description: "Duplication not yet implemented" });
                }}
              >
                <i className="fas fa-copy mr-2 text-accent" />
                DUPLICATE
              </Button>
              <Button
                className="w-full justify-start bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDelete}
                disabled={deleteAssetMutation.isPending}
              >
                <i className="fas fa-trash mr-2" />
                {deleteAssetMutation.isPending ? "DELETING..." : "DELETE"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
