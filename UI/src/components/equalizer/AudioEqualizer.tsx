import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { EqualizerBand } from "./EqualizerBand";
import { VolumeControl } from "./VolumeControl";
import { PresetSelector, EQPreset } from "./PresetSelector";
import { LuaPresetManager } from "@/components/equalizer/LuaPresetManager";
import { Settings, Power, Play, Pause, ChevronDown } from "lucide-react";
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
  const [connectionError, setConnectionError] = useState<string | null>(null);
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

  // Manual audio connection handler (requires user gesture)
  const handleConnectAudio = useCallback(async () => {
    if (!audioService.isAvailable()) {
      setConnectionError('Extension APIs not available');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const success = await audioService.startCapture();
      setIsAudioInitialized(success);
      
      if (success) {
        setConnectionError(null);

        // Fetch initial media info from the page
        const info = await audioService.getMediaInfo();
        if (info) {
          setIsPlaying(!!info.isPlaying);
          const duration = info.duration && info.duration > 0 ? formatTime(info.duration) : '--:--';
          
        }
      } else {
        setConnectionError('Failed to start audio capture');
      }
    } catch (error) {
      setIsAudioInitialized(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsConnecting(false);
    }
  }, []);

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
        const duration = info.duration && info.duration > 0 ? formatTime(info.duration) : '--:--';
       
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
          "max-w-6xl mx-auto p-8 rounded-2xl",
          "bg-eq-background border border-eq-border",
          "flex items-center justify-center min-h-[600px]",
          className,
        )}
      >
        {/* Power On Button */}
        <button
          onClick={() => setIsPowerOn(true)}
          className={cn(
            "p-8 rounded-full bg-eq-surface border border-eq-border",
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
            <Power size={20} />
          </button>
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

      {/* Audio Connection Instructions - Only show if not initialized */}
      {!isAudioInitialized && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <div className="text-eq-text font-medium mb-1">Audio Capture Required</div>
              <div className="text-eq-text-dim text-sm mb-3">
                Click "Connect Audio" below to start capturing audio from this tab. 
                Make sure the tab has audio content (YouTube, Spotify, etc.) and click the button to begin.
              </div>
              <button
                onClick={handleConnectAudio}
                disabled={isConnecting}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "bg-gradient-to-r from-eq-accent to-eq-accent-glow",
                  "text-eq-background hover:shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "hover:scale-105 active:scale-95"
                )}
              >
                {isConnecting ? "Connecting..." : "Connect Audio"}
              </button>
              {connectionError && (
                <div className="mt-2 text-red-400 text-xs">
                  Error: {connectionError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
          />
        </div>

        {/* Center Column - Equalizer */}
        <div className="space-y-6">
          {/* Presets and Playback Controls */}
          <div className="flex items-center gap-4 mb-4">
            {/* Preset Dropdown */}
            <div className="relative" data-preset-dropdown>
              <button
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-eq-surface border border-eq-border",
                  "text-eq-text hover:bg-eq-surface-light",
                  "transition-all duration-200"
                )}
              >
                <span>{activePreset}</span>
                <ChevronDown size={16} className={cn(
                  "transition-transform duration-200",
                  showPresetDropdown && "rotate-180"
                )} />
              </button>
              
              {showPresetDropdown && (
                <div className={cn(
                  "absolute top-full left-0 mt-2 min-w-[140px] z-50",
                  "bg-eq-surface border border-eq-border rounded-lg shadow-lg",
                  "py-1"
                )}>
                  {EQ_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm",
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
                "p-2 rounded-lg transition-all duration-200",
                isAudioInitialized 
                  ? "bg-eq-accent text-eq-background hover:bg-eq-accent-glow hover:scale-105"
                  : "bg-eq-surface-light text-eq-text-dim cursor-not-allowed",
              )}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className={cn(
                "px-3 py-2 text-sm rounded-lg",
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
              "p-6 rounded-xl bg-gradient-to-r from-eq-surface to-eq-surface-light",
              "border border-eq-border",
            )}
          >
            <div className="flex justify-between items-start gap-4 overflow-x-auto pb-4">
              {FREQUENCY_BANDS.map((frequency, index) => (
                <EqualizerBand
                  key={`${frequency}-${index}`} // More specific key to ensure re-render
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

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
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
                  {activePreset}
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
              <div className="flex justify-between">
                <span>Audio Status:</span>
                <span className={isAudioInitialized ? "text-green-400" : "text-red-400"}>
                  {isAudioInitialized ? "Connected" : "Disconnected"}
                </span>
              </div>
              
              {/* Disconnect button - only show when connected */}
              {isAudioInitialized && (
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      if (audioService.isAvailable()) {
                        await audioService.stopCapture();
                        setIsAudioInitialized(false);
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "bg-gradient-to-r from-red-500 to-red-600",
                      "text-white hover:shadow-lg",
                      "hover:scale-105 active:scale-95"
                    )}
                  >
                    Disconnect Audio
                  </button>
                </div>
              )}
            </div>
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