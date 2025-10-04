import React from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
} from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;

  className?: string;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 p-6 rounded-xl",
        "bg-gradient-to-r from-eq-surface via-eq-surface-light to-eq-surface",
        "border border-eq-border",
        className,
      )}
    >

      {/* Play/Pause Button */}
      <button
        onClick={onPlayPause}
        className={cn(
          "p-4 rounded-full transition-all duration-300",
          "bg-gradient-to-r from-eq-accent to-eq-accent-glow",
          "text-eq-background shadow-lg hover:shadow-xl",
          "hover:scale-105 active:scale-95",
          "eq-glow",
          {
            "animate-eq-pulse": isPlaying,
          },
        )}
      >
        {isPlaying ? <Pause size={28} /> : <Play size={28} />}
      </button>

    </div>
  );
};
