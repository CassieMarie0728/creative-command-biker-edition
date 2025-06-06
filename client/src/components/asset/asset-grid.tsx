import { AssetCard } from "./asset-card";
import type { AssetWithDetails } from "@shared/schema";

interface AssetGridProps {
  assets: AssetWithDetails[];
  selectedAssetIds: number[];
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'name' | 'size' | 'type';
  onAssetSelect: (assetId: number, selected: boolean) => void;
  onAssetPreview: (assetId: number) => void;
}

export function AssetGrid({
  assets,
  selectedAssetIds,
  viewMode,
  sortBy,
  onAssetSelect,
  onAssetPreview,
}: AssetGridProps) {
  // Sort assets
  const sortedAssets = [...assets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      case 'type':
        return a.fileType.localeCompare(b.fileType);
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-images text-6xl text-muted-foreground mb-4"></i>
          <h3 className="text-xl font-bold text-foreground mb-2">
            NO ASSETS FOUND
          </h3>
          <p className="text-muted-foreground">
            Drop some files onto the workbench to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        : "space-y-2"
    }>
      {sortedAssets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selectedAssetIds.includes(asset.id)}
          viewMode={viewMode}
          onSelect={(selected) => onAssetSelect(asset.id, selected)}
          onPreview={() => onAssetPreview(asset.id)}
        />
      ))}
    </div>
  );
}
