import { useCallback } from "react";
import { useThemeContext } from "@/components/ui/theme-provider";
import { playSound } from "@/lib/audio";

export function useAudio() {
  const { soundEnabled } = useThemeContext();

  const playEngineRev = useCallback(() => {
    if (soundEnabled) {
      playSound('engine-rev');
    }
  }, [soundEnabled]);

  const playUploadComplete = useCallback(() => {
    if (soundEnabled) {
      playSound('upload-complete');
    }
  }, [soundEnabled]);

  const playClank = useCallback(() => {
    if (soundEnabled) {
      playSound('metal-clank');
    }
  }, [soundEnabled]);

  const playSpark = useCallback(() => {
    if (soundEnabled) {
      playSound('spark');
    }
  }, [soundEnabled]);

  const playExhaust = useCallback(() => {
    if (soundEnabled) {
      playSound('exhaust-pop');
    }
  }, [soundEnabled]);

  return {
    playEngineRev,
    playUploadComplete,
    playClank,
    playSpark,
    playExhaust,
  };
}
