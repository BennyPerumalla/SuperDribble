import React from "react";
import { cn } from "@/lib/utils";

export interface EQPreset {
  name: string;
  values: number[];
}

interface PresetSelectorProps {
  presets: EQPreset[];
  activePreset: string | null;
  onPresetSelect: (preset: EQPreset) => void;
  onReset: () => void;
  className?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  activePreset,
  onPresetSelect,
  onReset,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 p-4 rounded-xl",
        "bg-gradient-to-r from-eq-surface via-eq-surface-light to-eq-surface",
        "border border-eq-border",
        className,
      )}
    >
      <div className="text-sm font-medium text-eq-text-dim mr-3">Presets:</div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className={cn(
          "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
          "border border-eq-border hover:border-eq-accent",
          "hover:bg-eq-surface-light hover:text-eq-accent",
          {
            "bg-eq-surface-light text-eq-accent border-eq-accent":
              activePreset === null,
            "text-eq-text-dim": activePreset !== null,
          },
        )}
      >
        Flat
      </button>

      {/* Preset Buttons */}
      {presets.map((preset) => (
        <button
          key={preset.name}
          onClick={() => onPresetSelect(preset)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
            "border border-eq-border hover:border-eq-accent",
            "hover:bg-eq-surface-light hover:text-eq-accent",
            {
              "bg-gradient-to-r from-eq-accent to-eq-accent-glow text-eq-background":
                activePreset === preset.name,
              "text-eq-text-dim": activePreset !== preset.name,
            },
          )}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
};
