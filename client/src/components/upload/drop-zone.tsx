import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/hooks/use-audio";

interface DropZoneProps {
  toolkitId: number;
  folderId?: number | null;
  onUploadComplete: () => void;
}

export function DropZone({ toolkitId, folderId, onUploadComplete }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const { playEngineRev, playUploadComplete } = useAudio();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      playUploadComplete();
      queryClient.invalidateQueries({ queryKey: ['/api/toolkits'] });
      onUploadComplete();
      setIsUploading(false);
      setUploadProgress({});
      toast({
        title: "FILES SLAMMED ONTO WORKBENCH",
        description: "Upload complete, parts ready for action",
      });
    },
    onError: () => {
      setIsUploading(false);
      setUploadProgress({});
      toast({
        title: "UPLOAD FAILED",
        description: "Something went wrong, try again",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [toolkitId, folderId]);

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    playEngineRev();
    
    // Simulate upload progress for multiple files
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        files.forEach(file => {
          if (!newProgress[file.name]) {
            newProgress[file.name] = 0;
          }
          newProgress[file.name] = Math.min(100, newProgress[file.name] + Math.random() * 30);
        });
        return newProgress;
      });
    }, 200);

    try {
      // Upload files one by one
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('toolkitId', toolkitId.toString());
        if (folderId) {
          formData.append('folderId', folderId.toString());
        }
        
        await uploadMutation.mutateAsync(formData);
        
        // Complete progress for this file
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      }
    } finally {
      clearInterval(progressInterval);
    }
  };

  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,audio/*,video/*,.pdf,.svg,.ai,.eps,.psd';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        handleFileUpload(files);
      }
    };
    input.click();
  };

  const totalProgress = Object.keys(uploadProgress).length > 0 
    ? Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / Object.keys(uploadProgress).length
    : 0;

  return (
    <div className="mb-8">
      <div
        className={`drag-zone workbench-texture rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver ? 'drag-over' : ''
        } ${isUploading ? 'spark-animation' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <i className={`fas fa-hammer text-6xl text-muted-foreground transition-all duration-500 ${
              isUploading ? 'gear-spin text-accent' : isDragOver ? 'text-primary pulse-red' : ''
            }`} />
          </div>
          
          <h3 className="font-bold text-xl tracking-wider text-foreground mb-2">
            {isUploading ? 'SLAMMING FILES...' : 'SLAM YOUR FILES HERE'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {isUploading 
              ? 'Upload in progress, stand by...'
              : 'Drop files onto the workbench or click to browse'
            }
          </p>

          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="mb-4 space-y-2">
              <Progress value={totalProgress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                Uploading {Object.keys(uploadProgress).length} file(s)... {Math.round(totalProgress)}%
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {Object.entries(uploadProgress).map(([filename, progress]) => (
                  <div key={filename} className="flex justify-between text-xs">
                    <span className="truncate flex-1 mr-2">{filename}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isUploading && (
            <Button
              onClick={openFileDialog}
              className="chrome-accent px-6 py-3 rounded-lg font-bold text-sm tracking-wide hover:shadow-lg transition-all"
            >
              <i className="fas fa-upload mr-2" />
              BROWSE FILES
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            Supports: Images, Audio, Video, PDFs, Vectors
          </p>
        </div>
      </div>
    </div>
  );
}