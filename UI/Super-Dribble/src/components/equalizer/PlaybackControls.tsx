import React from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  isShuffleEnabled: boolean;
  isRepeatEnabled: boolean;
  className?: string;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onRepeat,
  isShuffleEnabled,
  isRepeatEnabled,
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
      {/* Shuffle Button */}
      <button
        onClick={onShuffle}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "hover:bg-eq-surface-light hover:scale-105",
          {
            "text-eq-accent bg-eq-surface-light eq-glow": isShuffleEnabled,
            "text-eq-text-dim hover:text-eq-text": !isShuffleEnabled,
          },
        )}
      >
        <Shuffle size={20} />
      </button>

      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className={cn(
          "p-3 rounded-xl transition-all duration-200",
          "text-eq-text hover:text-eq-accent hover:bg-eq-surface-light",
          "hover:scale-105 active:scale-95",
        )}
      >
        <SkipBack size={24} />
      </button>

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

      {/* Next Button */}
      <button
        onClick={onNext}
        className={cn(
          "p-3 rounded-xl transition-all duration-200",
          "text-eq-text hover:text-eq-accent hover:bg-eq-surface-light",
          "hover:scale-105 active:scale-95",
        )}
      >
        <SkipForward size={24} />
      </button>

      {/* Repeat Button */}
      <button
        onClick={onRepeat}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "hover:bg-eq-surface-light hover:scale-105",
          {
            "text-eq-accent bg-eq-surface-light eq-glow": isRepeatEnabled,
            "text-eq-text-dim hover:text-eq-text": !isRepeatEnabled,
          },
        )}
      >
        <Repeat size={20} />
      </button>
    </div>
  );
};
