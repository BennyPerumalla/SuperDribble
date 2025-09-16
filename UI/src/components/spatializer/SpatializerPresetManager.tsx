import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SpatialPreset {
  name: string;
  description: string;
  params: {
    width: number;
    decay: number;
    damping: number;
    mix: number;
  };
}

const DEFAULT_PRESETS: SpatialPreset[] = [
  {
    name: "Auditorium",
    description: "Large concert hall with natural acoustics and wide stereo image.",
    params: { width: 1.4, decay: 0.7, damping: 0.4, mix: 0.35 }
  },
  {
    name: "Echo",
    description: "Sharp, distinct echoes with minimal diffusion.",
    params: { width: 1.2, decay: 0.6, damping: 0.2, mix: 0.25 }
  },
  {
    name: "Great Hall",
    description: "Massive cathedral-like space with long, lush reverb.",
    params: { width: 1.6, decay: 0.9, damping: 0.3, mix: 0.45 }
  },
  {
    name: "Light Reverb",
    description: "Subtle room ambience with minimal coloration.",
    params: { width: 1.1, decay: 0.3, damping: 0.7, mix: 0.15 }
  },
  {
    name: "Small Room",
    description: "Intimate space with tight, controlled reverb.",
    params: { width: 1.0, decay: 0.2, damping: 0.8, mix: 0.20 }
  },
  {
    name: "Stadium",
    description: "Outdoor stadium with wide stereo and long decay.",
    params: { width: 1.9, decay: 0.8, damping: 0.4, mix: 0.40 }
  },
  {
    name: "Studio",
    description: "Professional recording studio with controlled acoustics.",
    params: { width: 1.0, decay: 0.25, damping: 0.9, mix: 0.15 }
  }
];

interface SpatializerPresetManagerProps {
  onPresetSelect?: (preset: SpatialPreset) => void;
  className?: string;
}

export const SpatializerPresetManager: React.FC<SpatializerPresetManagerProps> = ({
  onPresetSelect,
  className,
}) => {
  const handlePresetChange = useCallback((value: string) => {
    const preset = DEFAULT_PRESETS.find(p => p.name === value);
    if (preset && onPresetSelect) {
      onPresetSelect(preset);
    }
  }, [onPresetSelect]);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Presets</span>
      </div>
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a preset..." />
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_PRESETS.map((preset) => (
            <SelectItem key={preset.name} value={preset.name}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SpatializerPresetManager;
