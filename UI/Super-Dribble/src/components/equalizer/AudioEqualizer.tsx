import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EqualizerBand } from "./EqualizerBand";
import { SpectrumAnalyzer } from "./SpectrumAnalyzer";
import { PlaybackControls } from "./PlaybackControls";
import { VolumeControl } from "./VolumeControl";
import { PresetSelector, EQPreset } from "./PresetSelector";
import { Settings, Power } from "lucide-react";

const FREQUENCY_BANDS = [
  "32Hz",
  "64Hz",
  "125Hz",
  "250Hz",
  "500Hz",
  "1kHz",
  "2kHz",
  "4kHz",
  "8kHz",
  "16kHz",
];

const EQ_PRESETS: EQPreset[] = [
  {
    name: "Rock",
    values: [5, 3, -1, -2, -1, 2, 4, 6, 6, 5],
  },
  {
    name: "Pop",
    values: [-1, 2, 4, 4, 2, 0, -1, -1, 0, 1],
  },
  {
    name: "Jazz",
    values: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  },
  {
    name: "Classical",
    values: [4, 3, 2, 1, -1, -2, -2, -1, 2, 3],
  },
  {
    name: "Electronic",
    values: [6, 4, 1, 0, -2, 2, 1, 2, 6, 7],
  },
  {
    name: "Hip Hop",
    values: [7, 5, 1, 3, -1, -1, 1, 2, 3, 4],
  },
];

interface AudioEqualizerProps {
  className?: string;
}

export const AudioEqualizer: React.FC<AudioEqualizerProps> = ({
  className,
}) => {
  const [eqValues, setEqValues] = useState<number[]>(new Array(10).fill(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [currentTrack] = useState({
    title: "Neon Dreams",
    artist: "Synthwave Station",
    duration: "3:42",
  });

  const handleBandChange = useCallback((index: number, value: number) => {
    setEqValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
    setActivePreset(null); // Clear preset when manually adjusting
  }, []);

  const handlePresetSelect = useCallback((preset: EQPreset) => {
    setEqValues(preset.values);
    setActivePreset(preset.name);
  }, []);

  const handleReset = useCallback(() => {
    setEqValues(new Array(10).fill(0));
    setActivePreset(null);
  }, []);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted],
  );

  if (!isPowerOn) {
    return (
      <div
        className={cn(
          "max-w-6xl mx-auto p-8 rounded-2xl",
          "bg-eq-background border border-eq-border",
          "flex items-center justify-center min-h-[600px]",
          className,
        )}
      >
        <button
          onClick={() => setIsPowerOn(true)}
          className={cn(
            "p-8 rounded-full bg-eq-surface border border-eq-border",
            "text-eq-text-dim hover:text-eq-accent transition-all duration-300",
            "hover:bg-eq-surface-light hover:scale-105",
          )}
        >
          <Power size={48} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "max-w-6xl mx-auto p-8 rounded-2xl",
        "bg-gradient-to-br from-eq-background via-eq-surface to-eq-background",
        "border border-eq-border shadow-2xl",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-eq-accent rounded-full animate-eq-pulse" />
          <h1 className="text-2xl font-bold text-eq-text eq-text-glow">
            Super Dribble
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              "p-2 rounded-lg text-eq-text-dim hover:text-eq-accent",
              "hover:bg-eq-surface-light transition-all duration-200",
            )}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setIsPowerOn(false)}
            className={cn(
              "p-2 rounded-lg text-eq-text-dim hover:text-eq-danger",
              "hover:bg-eq-surface-light transition-all duration-200",
            )}
          >
            <Power size={20} />
          </button>
        </div>
      </div>

      {/* Now Playing */}
      <div className="mb-6 p-4 rounded-xl bg-eq-surface border border-eq-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-eq-text font-medium">{currentTrack.title}</div>
            <div className="text-eq-text-dim text-sm">
              {currentTrack.artist}
            </div>
          </div>
          <div className="text-eq-text-dim font-mono text-sm">
            {currentTrack.duration}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Spectrum Analyzer */}
        <div className="space-y-6">
          <SpectrumAnalyzer isPlaying={isPlaying} />
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={() => setIsMuted(!isMuted)}
          />
        </div>

        {/* Center Column - Equalizer */}
        <div className="space-y-6">
          {/* EQ Bands */}
          <div
            className={cn(
              "p-6 rounded-xl bg-gradient-to-r from-eq-surface to-eq-surface-light",
              "border border-eq-border",
            )}
          >
            <div className="flex justify-between items-start gap-4 overflow-x-auto pb-4">
              {FREQUENCY_BANDS.map((frequency, index) => (
                <EqualizerBand
                  key={frequency}
                  frequency={frequency}
                  value={eqValues[index]}
                  onChange={(value) => handleBandChange(index, value)}
                  isActive={isPlaying && eqValues[index] !== 0}
                  className="flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Presets */}
          <PresetSelector
            presets={EQ_PRESETS}
            activePreset={activePreset}
            onPresetSelect={handlePresetSelect}
            onReset={handleReset}
          />
        </div>

        {/* Right Column - Controls */}
        <div className="space-y-6">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onPrevious={() => console.log("Previous track")}
            onNext={() => console.log("Next track")}
            onShuffle={() => setIsShuffleEnabled(!isShuffleEnabled)}
            onRepeat={() => setIsRepeatEnabled(!isRepeatEnabled)}
            isShuffleEnabled={isShuffleEnabled}
            isRepeatEnabled={isRepeatEnabled}
          />

          {/* EQ Info Panel */}
          <div
            className={cn(
              "p-4 rounded-xl bg-eq-surface border border-eq-border",
            )}
          >
            <h3 className="text-sm font-medium text-eq-text mb-3">EQ Status</h3>
            <div className="space-y-2 text-xs text-eq-text-dim">
              <div className="flex justify-between">
                <span>Active Preset:</span>
                <span className="text-eq-accent">
                  {activePreset || "Custom"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bands Modified:</span>
                <span className="text-eq-accent">
                  {eqValues.filter((v) => v !== 0).length}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span>Peak Gain:</span>
                <span className="text-eq-accent">
                  {Math.max(...eqValues).toFixed(1)}dB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
