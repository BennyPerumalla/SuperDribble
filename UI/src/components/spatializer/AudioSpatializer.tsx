import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SpatializerControl } from "./SpatializerControl";
import { SpatializerPresetManager, SpatialPreset } from "./SpatializerPresetManager";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioService } from "@/lib/audioService";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_PARAMS = {
  width: 1.0,
  decay: 0.5,
  damping: 0.5,
  mix: 0.3
};

interface AudioSpatializerProps {
  className?: string;
  onParamsChange?: (params: {
    width: number;
    decay: number;
    damping: number;
    mix: number;
  }) => void;
}

export const AudioSpatializer: React.FC<AudioSpatializerProps> = ({
  className,
  onParamsChange,
}) => {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize audio service and set up parameter updates
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if audio service is available
        if (!audioService.isAvailable()) {
          console.warn('Audio service not available in this context');
          return;
        }

        // Initialize audio capture if not already done
        if (!isInitialized) {
          const success = await audioService.startCapture();
          if (success) {
            setIsInitialized(true);
            // Apply initial parameters
            await updateSpatialization(params, isPowerOn);
          } else {
            toast({
              title: "Audio initialization failed",
              description: "Could not initialize audio processing",
              variant: "destructive",
            });
          }
        } else {
          // Just update parameters if already initialized
          await updateSpatialization(params, isPowerOn);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
        toast({
          title: "Audio error",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (isInitialized) {
        // Don't stop capture here as it might be used by other components
        // Just reset spatialization
        audioService.updateSpatialization({
          enabled: false,
          width: 1.0,
          decay: 0.5,
          damping: 0.5,
          mix: 0
        }).catch(console.error);
      }
    };
  }, [isPowerOn]); // Only re-run when power state changes

  // Update spatialization when parameters change
  useEffect(() => {
    if (isInitialized && isPowerOn) {
      updateSpatialization(params, true).catch(console.error);
    }
  }, [params, isInitialized, isPowerOn]);

  // Update spatialization parameters in the audio service
  const updateSpatialization = async (newParams: typeof DEFAULT_PARAMS, enabled: boolean) => {
    try {
      const success = await audioService.updateSpatialization({
        ...newParams,
        enabled
      });
      
      if (!success) {
        throw new Error('Failed to update spatialization parameters');
      }
    } catch (error) {
      console.error('Error updating spatialization:', error);
      toast({
        title: "Update failed",
        description: "Could not update spatialization settings",
        variant: "destructive",
      });
    }
  };

  const handleParamChange = useCallback((param: keyof typeof params, value: number) => {
    const newParams = {
      ...params,
      [param]: value
    };
    
    setParams(newParams);
    setActivePreset(null);
    
    // Update audio service if powered on
    if (isInitialized && isPowerOn) {
      updateSpatialization(newParams, true).catch(console.error);
    }
  }, [params, isInitialized, isPowerOn]);

  const handlePresetSelect = useCallback(async (preset: SpatialPreset) => {
    setParams(preset.params);
    setActivePreset(preset.name);
    
    // Update audio service if powered on
    if (isInitialized && isPowerOn) {
      await updateSpatialization(preset.params, true);
    }
  }, [isInitialized, isPowerOn]);

  const handleReset = useCallback(async () => {
    setParams(DEFAULT_PARAMS);
    setActivePreset(null);
    
    if (isInitialized && isPowerOn) {
      await updateSpatialization(DEFAULT_PARAMS, true);
    }
  }, [isInitialized, isPowerOn]);

  const togglePower = useCallback(async () => {
    const newPowerState = !isPowerOn;
    setIsPowerOn(newPowerState);
    
    if (isInitialized) {
      await updateSpatialization(params, newPowerState);
    }
  }, [isInitialized, isPowerOn, params]);

  return (
    <div className={cn("flex flex-col space-y-6 p-4 bg-card rounded-lg shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Spatializer</h3>
        <button
          onClick={togglePower}
          className={cn(
            "p-2 rounded-full transition-colors",
            isPowerOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
          aria-label={isPowerOn ? "Disable spatializer" : "Enable spatializer"}
        >
          <Power className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <SpatializerPresetManager
            onPresetSelect={handlePresetSelect}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isPowerOn}
            className="ml-2"
          >
            Reset
          </Button>
        </div>

        <div className="flex justify-center items-end space-x-6 pt-4">
          <SpatializerControl
            label="Width"
            value={params.width}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={(value) => handleParamChange("width", value)}
            disabled={!isPowerOn}
          />
          <SpatializerControl
            label="Decay"
            value={params.decay}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) => handleParamChange("decay", value)}
            disabled={!isPowerOn}
          />
          <SpatializerControl
            label="Damping"
            value={params.damping}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) => handleParamChange("damping", value)}
            disabled={!isPowerOn}
          />
          <SpatializerControl
            label="Mix"
            value={params.mix}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) => handleParamChange("mix", value)}
            formatValue={(value) => `${Math.round(value * 100)}%`}
            disabled={!isPowerOn}
          />
        </div>
      </div>

      {activePreset && (
        <div className="text-xs text-muted-foreground text-center">
          Using preset: <span className="font-medium">{activePreset}</span>
        </div>
      )}
    </div>
  );
};

export default AudioSpatializer;
