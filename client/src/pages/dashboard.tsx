import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandBar } from "@/components/layout/command-bar";
import { DropZone } from "@/components/upload/drop-zone";
import { AssetGrid } from "@/components/asset/asset-grid";
import { PreviewPanel } from "@/components/asset/preview-panel";
import type { AssetWithDetails, ToolkitWithFolders } from "@shared/schema";

export default function Dashboard() {
  const [selectedToolkitId, setSelectedToolkitId] = useState<number | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [previewAssetId, setPreviewAssetId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date');

  // Fetch toolkits
  const { data: toolkits = [] } = useQuery<ToolkitWithFolders[]>({
    queryKey: ['/api/toolkits'],
  });

  // Fetch assets for selected toolkit/folder
  const { data: assets = [], refetch: refetchAssets } = useQuery<AssetWithDetails[]>({
    queryKey: ['/api/toolkits', selectedToolkitId, 'assets', selectedFolderId],
    enabled: selectedToolkitId !== null,
  });

  // Get preview asset data
  const { data: previewAsset } = useQuery<AssetWithDetails>({
    queryKey: ['/api/assets', previewAssetId],
    enabled: previewAssetId !== null,
  });

  const handleAssetSelection = (assetId: number, selected: boolean) => {
    setSelectedAssetIds(prev => 
      selected 
        ? [...prev, assetId]
        : prev.filter(id => id !== assetId)
    );
  };

  const handleSelectAll = () => {
    setSelectedAssetIds(assets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssetIds([]);
  };

  const handleUploadComplete = () => {
    refetchAssets();
  };

  // Get current location breadcrumb
  const selectedToolkit = toolkits.find(t => t.id === selectedToolkitId);
  const selectedFolder = selectedToolkit?.folders.find(f => f.id === selectedFolderId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        toolkits={toolkits}
        selectedToolkitId={selectedToolkitId}
        selectedFolderId={selectedFolderId}
        onSelectToolkit={setSelectedToolkitId}
        onSelectFolder={setSelectedFolderId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Command Bar */}
        <CommandBar
          selectedToolkit={selectedToolkit}
          selectedFolder={selectedFolder}
          selectedAssetIds={selectedAssetIds}
          viewMode={viewMode}
          sortBy={sortBy}
          onViewModeChange={setViewMode}
          onSortChange={setSortBy}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onRefresh={refetchAssets}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedToolkitId ? (
            <>
              {/* Drop Zone */}
              <DropZone
                toolkitId={selectedToolkitId}
                folderId={selectedFolderId}
                onUploadComplete={handleUploadComplete}
              />

              {/* Asset Grid */}
              <AssetGrid
                assets={assets}
                selectedAssetIds={selectedAssetIds}
                viewMode={viewMode}
                sortBy={sortBy}
                onAssetSelect={handleAssetSelection}
                onAssetPreview={setPreviewAssetId}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-toolbox text-6xl text-muted-foreground mb-4"></i>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  SELECT A TOOLKIT
                </h2>
                <p className="text-muted-foreground">
                  Choose a toolkit from the sidebar to start managing your assets
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {previewAsset && (
        <PreviewPanel
          asset={previewAsset}
          onClose={() => setPreviewAssetId(null)}
          onUpdate={refetchAssets}
        />
      )}
    </div>
  );
}
