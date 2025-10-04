import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { EqualizerBand } from "./EqualizerBand";
import { VolumeControl } from "./VolumeControl";
import { PresetSelector, EQPreset } from "./PresetSelector";
import { LuaPresetManager } from "@/components/equalizer/LuaPresetManager";
import { Settings, Power, Play, Pause, ChevronDown, Wifi, WifiOff } from "lucide-react";
import { audioService } from "@/lib/audioService";

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
    name: "Flat",
    values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
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
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Flat");
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const handleBandChange = useCallback(async (index: number, value: number) => {
    setEqValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
    setActivePreset("Custom"); 
    
    // Update audio processing if available
    if (audioService.isAvailable() && isAudioInitialized) {
      await audioService.updateEQBand(index, value);
    }
  }, [isAudioInitialized]);

  const handlePresetSelect = useCallback(async (preset: EQPreset) => {
    setEqValues([...preset.values]); 
    setActivePreset(preset.name);
    setShowPresetDropdown(false);
    
    // Update audio processing if available
    if (audioService.isAvailable() && isAudioInitialized) {
      await audioService.updateEQPreset(preset);
    }
  }, [isAudioInitialized]);

  const handleReset = useCallback(async () => {
    const resetValues = new Array(10).fill(0);
    setEqValues([...resetValues]); 
    setActivePreset("Flat");
    
    // Update audio processing if available
    if (audioService.isAvailable() && isAudioInitialized) {
      await audioService.updateEQPreset({ name: 'Flat', values: resetValues });
    }
  }, [isAudioInitialized]);

  const handleVolumeChange = useCallback(
    async (newVolume: number) => {
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
      
      // Update audio processing if available
      if (audioService.isAvailable() && isAudioInitialized) {
        await audioService.updateVolume(newVolume);
      }
    },
    [isMuted, isAudioInitialized],
  );

  const handleToggleMute = useCallback(async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Update audio processing if available
    if (audioService.isAvailable() && isAudioInitialized) {
      await audioService.updateMute(newMutedState, volume);
    }
  }, [isMuted, volume, isAudioInitialized]);

  const handlePlayPause = useCallback(async () => {
    if (audioService.isAvailable()) {
      await audioService.controlPlayback('toggle');
      setIsPlaying(prev => !prev); // Optimistic update
    }
  }, []);

  // Audio connection/disconnection handler
  const handleToggleAudioConnection = useCallback(async () => {
    if (!audioService.isAvailable()) return;

    if (isAudioInitialized) {
      // Disconnect
      await audioService.stopCapture();
      setIsAudioInitialized(false);
    } else {
      // Connect
      setIsConnecting(true);
      try {
        const success = await audioService.startCapture();
        setIsAudioInitialized(success);
        
        if (success) {
          // Fetch initial media info from the page
          const info = await audioService.getMediaInfo();
          if (info) {
            setIsPlaying(!!info.isPlaying);
          }
        }
      } catch (error) {
        setIsAudioInitialized(false);
      } finally {
        setIsConnecting(false);
      }
    }
  }, [isAudioInitialized]);

  // Listen for media updates from the content script
  useEffect(() => {
    const listener = (request: any, sender: any) => {
      if (request && request.action === 'media_state_update') {
        const capturedId = audioService.getCapturedTabId();
        const senderId = sender?.tab?.id ?? null;
        // Accept updates if we don't know the tab yet, or if it matches.
        if (capturedId && senderId && capturedId !== senderId) return;

        // Update playback state
        if (typeof request.isPlaying === 'boolean') setIsPlaying(request.isPlaying);
      }
    };

    if (audioService.isAvailable()) {
      chrome.runtime.onMessage.addListener(listener);
    }
    return () => {
      try {
        if (audioService.isAvailable()) {
          // @ts-ignore
          chrome.runtime.onMessage.removeListener?.(listener);
        }
      } catch {}
    };
  }, []);

  // Periodic polling fallback in case events are missed
  useEffect(() => {
    if (!audioService.isAvailable()) return;
    if (!isAudioInitialized) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const info = await audioService.getMediaInfo();
        if (cancelled || !info) return;
        setIsPlaying(!!info.isPlaying);
      } catch {}
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAudioInitialized]);

  // Click outside handler for preset dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-preset-dropdown]')) {
        setShowPresetDropdown(false);
      }
    };
    
    if (showPresetDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresetDropdown]);

  if (!isPowerOn) {
    return (
      <div
        className={cn(
          "max-w-6xl mx-auto p-4 rounded-2xl",
          "bg-eq-background border border-eq-border",
          "flex items-center justify-center min-h-[500px]",
          className,
        )}
      >
        {/* Power On Button */}
        <button
          onClick={() => setIsPowerOn(true)}
          className={cn(
            "p-6 rounded-full bg-eq-surface border border-eq-border",
            "text-eq-text-dim hover:text-eq-accent transition-all duration-300",
            "hover:bg-eq-surface-light hover:scale-105",
          )}
        >
          <Settings size={48} />
        </button>
  
        {/* Lua Preset Manager */}
        <LuaPresetManager />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full p-4 rounded-2xl",
        "bg-gradient-to-br from-eq-background via-eq-surface to-eq-background",
        "border border-eq-border shadow-2xl",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-eq-accent rounded-full animate-eq-pulse" />
          <h1 className="text-xl font-bold text-eq-text eq-text-glow">
            Super Dribble
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Audio Connect/Disconnect Button */}
          <button
            onClick={handleToggleAudioConnection}
            disabled={isConnecting}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isAudioInitialized 
                ? "text-green-400 hover:text-red-400 hover:bg-eq-surface-light"
                : "text-eq-text-dim hover:text-green-400 hover:bg-eq-surface-light",
              isConnecting && "opacity-50 cursor-not-allowed"
            )}
            title={isAudioInitialized ? "Disconnect Audio" : "Connect Audio"}
          >
            {isAudioInitialized ? <Wifi size={20} /> : <WifiOff size={20} />}
          </button>
          
          {/* Power Button */}
          <button
            className={cn(
              "p-2 rounded-lg text-eq-text-dim hover:text-eq-accent",
              "hover:bg-eq-surface-light transition-all duration-200",
            )}
          >
            <Power size={20} />
          </button>
          
          {/* Settings Button */}
          <button
            onClick={() => setIsPowerOn(false)}
            className={cn(
              "p-2 rounded-lg text-eq-text-dim hover:text-eq-danger",
              "hover:bg-eq-surface-light transition-all duration-200",
            )}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Volume Control */}
        <div className="px-2">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
          />
        </div>

        {/* Presets and Playback Controls */}
        <div className="flex items-center gap-3 px-2">
          {/* Preset Dropdown */}
          <div className="relative" data-preset-dropdown>
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                "bg-eq-surface border border-eq-border",
                "text-eq-text text-sm hover:bg-eq-surface-light",
                "transition-all duration-200"
              )}
            >
              <span>{activePreset}</span>
              <ChevronDown size={14} className={cn(
                "transition-transform duration-200",
                showPresetDropdown && "rotate-180"
              )} />
            </button>
            
            {showPresetDropdown && (
              <div className={cn(
                "absolute top-full left-0 mt-1 min-w-[120px] z-50",
                "bg-eq-surface border border-eq-border rounded-lg shadow-lg",
                "py-1"
              )}>
                {EQ_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-xs",
                      "text-eq-text hover:bg-eq-surface-light",
                      "transition-colors duration-150",
                      activePreset === preset.name && "bg-eq-accent text-eq-background"
                    )}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={!isAudioInitialized}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200",
              isAudioInitialized 
                ? "bg-eq-accent text-eq-background hover:bg-eq-accent-glow hover:scale-105"
                : "bg-eq-surface-light text-eq-text-dim cursor-not-allowed",
            )}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className={cn(
              "px-3 py-1.5 text-xs rounded-lg",
              "bg-eq-surface border border-eq-border",
              "text-eq-text-dim hover:text-eq-text hover:bg-eq-surface-light",
              "transition-all duration-200"
            )}
          >
            Reset
          </button>
        </div>

        {/* EQ Bands */}
        <div
          className={cn(
            "p-2 rounded-xl bg-gradient-to-r from-eq-surface to-eq-surface-light",
            "border border-eq-border overflow-x-auto overflow-y-hidden",
          )}
        >
          <div className="flex justify-between items-start gap-1 min-w-fit pb-2">
            {FREQUENCY_BANDS.map((frequency, index) => (
              <EqualizerBand
                key={`${frequency}-${index}`} 
                frequency={frequency}
                value={eqValues[index]}
                onChange={(value) => handleBandChange(index, value)}
                isActive={isPlaying && eqValues[index] !== 0}
                className="flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility to format seconds to mm:ss
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}