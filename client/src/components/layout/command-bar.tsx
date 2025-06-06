import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Toolkit, Folder } from "@shared/schema";

interface CommandBarProps {
  selectedToolkit?: Toolkit;
  selectedFolder?: Folder;
  selectedAssetIds: number[];
  viewMode: 'grid' | 'list';
  sortBy: 'date' | 'name' | 'size' | 'type';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sort: 'date' | 'name' | 'size' | 'type') => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function CommandBar({
  selectedToolkit,
  selectedFolder,
  selectedAssetIds,
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
  onSelectAll,
  onClearSelection,
  onRefresh,
}: CommandBarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async (assetIds: number[]) => {
      const response = await apiRequest("POST", "/api/assets/bulk", {
        action: "delete",
        assetIds,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      onClearSelection();
      toast({
        title: "ASSETS NUKED",
        description: `${selectedAssetIds.length} files eliminated`,
      });
    },
  });

  const bulkTagMutation = useMutation({
    mutationFn: async (data: { assetIds: number[]; status: string }) => {
      const response = await apiRequest("POST", "/api/assets/bulk", {
        action: "update",
        assetIds: data.assetIds,
        data: { status: data.status },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      onClearSelection();
      toast({
        title: "ASSETS TAGGED",
        description: `${selectedAssetIds.length} files marked`,
      });
    },
  });

  const handleBulkTag = (status: string) => {
    bulkTagMutation.mutate({ assetIds: selectedAssetIds, status });
  };

  const handleBulkDelete = () => {
    if (confirm(`ARE YOU SURE? This will permanently delete ${selectedAssetIds.length} files.`)) {
      bulkDeleteMutation.mutate(selectedAssetIds);
    }
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {selectedToolkit && (
            <>
              <h1 className="font-bold text-xl tracking-wider text-foreground">
                {selectedToolkit.name.toUpperCase()}
              </h1>
              {selectedFolder && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <i className="fas fa-folder-open" />
                  <span>/ {selectedFolder.name}</span>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex bg-background rounded border border-border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <i className="fas fa-th-large" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <i className="fas fa-list" />
            </Button>
          </div>
          
          {/* Sort Controls */}
          <Select value={sortBy} onValueChange={(value: any) => onSortChange(value)}>
            <SelectTrigger className="w-40 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">SORT BY DATE</SelectItem>
              <SelectItem value="name">SORT BY NAME</SelectItem>
              <SelectItem value="size">SORT BY SIZE</SelectItem>
              <SelectItem value="type">SORT BY TYPE</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Refresh Button */}
          <Button onClick={onRefresh} variant="outline" size="sm" className="metal-button">
            <i className="fas fa-sync mr-2" />
            REFRESH
          </Button>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedAssetIds.length > 0 && (
        <div className="mt-4 bg-primary/20 border border-primary rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="destructive" className="bg-primary text-primary-foreground">
                <i className="fas fa-crosshairs mr-2" />
                {selectedAssetIds.length} FILES ARMED
              </Badge>
              <div className="h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-foreground hover:text-accent transition-colors"
              >
                CLEAR SELECTION
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkTag("HELL YEAH")}
                disabled={bulkTagMutation.isPending}
                className="metal-button"
              >
                <i className="fas fa-tags mr-2" />
                HELL YEAH
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkTag("IN THE WIND")}
                disabled={bulkTagMutation.isPending}
                className="metal-button"
              >
                <i className="fas fa-tags mr-2" />
                IN THE WIND
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkTag("NEEDS FIXIN")}
                disabled={bulkTagMutation.isPending}
                className="metal-button"
              >
                <i className="fas fa-tags mr-2" />
                NEEDS FIXIN
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <i className="fas fa-bomb mr-2" />
                NUKE IT
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
