import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { AssetWithDetails } from "@shared/schema";

interface AssetCardProps {
  asset: AssetWithDetails;
  isSelected: boolean;
  viewMode: 'grid' | 'list';
  onSelect: (selected: boolean) => void;
  onPreview: () => void;
}

export function AssetCard({
  asset,
  isSelected,
  viewMode,
  onSelect,
  onPreview,
}: AssetCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'fa-image';
      case 'audio': return 'fa-music';
      case 'video': return 'fa-video';
      case 'pdf': return 'fa-file-pdf';
      case 'vector': return 'fa-vector-square';
      default: return 'fa-file';
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'image': return 'bg-blue-600';
      case 'audio': return 'bg-green-600';
      case 'video': return 'bg-purple-600';
      case 'pdf': return 'bg-red-600';
      case 'vector': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'hell yeah': return 'bg-accent text-background';
      case 'in the wind': return 'bg-primary text-primary-foreground';
      case 'needs fixin': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderPreview = () => {
    if (asset.fileType === 'image' && !imageError) {
      return (
        <img
          src={`/uploads/${asset.filePath.split('/').pop()}`}
          alt={asset.name}
          className="w-full h-32 object-cover"
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className="w-full h-32 bg-gradient-to-br from-muted to-background flex items-center justify-center">
        <i className={`fas ${getFileTypeIcon(asset.fileType)} text-4xl text-muted-foreground`} />
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className={`asset-card bg-card border border-border rounded-lg p-4 hover:border-primary transition-all group ${
        isSelected ? 'border-primary bg-primary/10' : ''
      }`}>
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="metal-checkbox"
          />
          
          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
            {renderPreview()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate">
              {asset.name}
            </h4>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
              <span>{formatFileSize(asset.size)}</span>
              {asset.width && asset.height && (
                <span>{asset.width}×{asset.height}</span>
              )}
              <span className="uppercase">{asset.fileType}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {asset.status && (
              <Badge className={getStatusColor(asset.status)}>
                {asset.status.toUpperCase()}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreview}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i className="fas fa-eye" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`asset-card bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-all group ${
      isSelected ? 'border-primary bg-primary/10' : ''
    }`}>
      <div className="relative">
        {renderPreview()}
        
        <div className="absolute top-2 left-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="metal-checkbox bg-background/80"
          />
        </div>
        
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
            className="bg-background/80 text-foreground p-1 rounded"
          >
            <i className="fas fa-eye text-xs" />
          </Button>
        </div>
        
        <div className="absolute bottom-2 left-2">
          <Badge className={`${getFileTypeColor(asset.fileType)} text-white text-xs font-bold`}>
            {asset.fileType.toUpperCase()}
          </Badge>
        </div>
      </div>
      
      <div className="p-3">
        <h4 className="font-semibold text-sm text-foreground truncate">
          {asset.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span>{formatFileSize(asset.size)}</span>
          {asset.width && asset.height ? (
            <span>{asset.width}×{asset.height}</span>
          ) : asset.duration ? (
            <span>{Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}</span>
          ) : null}
        </div>
        
        {(asset.status || asset.tags.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.status && (
              <Badge className={getStatusColor(asset.status)}>
                {asset.status.toUpperCase()}
              </Badge>
            )}
            {asset.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{asset.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
