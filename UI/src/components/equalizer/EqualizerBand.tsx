import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface EqualizerBandProps {
  frequency: string;
  value: number;
  onChange: (value: number) => void;
  isActive?: boolean;
  className?: string;
}

export const EqualizerBand: React.FC<EqualizerBandProps> = ({
  frequency,
  value,
  onChange,
  isActive = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }
  }, [isDragging]);

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      {/* Frequency Label */}
      <div className="text-xs font-mono text-eq-text-dim font-medium">
        {frequency}
      </div>

      {/* Slider Container */}
      <div className="relative h-48 w-8 flex flex-col items-center">
        {/* Background Track */}
        <div className="absolute inset-0 w-2 bg-eq-slider-track rounded-full mx-auto" />

        {/* Center Line (0dB) */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-eq-border transform -translate-y-0.5" />

        {/* Active Fill */}
        <div
          className={cn(
            "absolute w-2 rounded-full transition-all duration-200 mx-auto",
            {
              "bg-gradient-to-t from-eq-accent to-eq-accent-glow":
                value > 0 && isActive,
              "bg-gradient-to-b from-eq-accent to-eq-accent-glow":
                value < 0 && isActive,
              "bg-eq-accent/50": !isActive && value !== 0,
              "bg-transparent": value === 0,
            },
          )}
          style={{
            height: `${Math.abs(value) * 4}px`,
            top: value >= 0 ? `${50 - value * 2}%` : "50%",
            boxShadow: isActive
              ? `0 0 10px hsla(var(--eq-accent-glow), 0.6)`
              : "none",
          }}
        />

        {/* Slider Input */}
        <input
          type="range"
          min="-12"
          max="12"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className={cn(
            "absolute inset-0 w-8 h-full opacity-0 cursor-pointer",
            "focus:outline-none",
          )}
          style={{
            writingMode: "vertical-lr",

            WebkitAppearance: "slider-vertical",
          }}
        />

        {/* Thumb Indicator */}
        <div
          className={cn(
            "absolute w-6 h-3 bg-eq-slider-thumb rounded-sm border border-eq-background",
            "transition-all duration-200 pointer-events-none",
            {
              "shadow-lg shadow-eq-accent-glow/50 scale-110":
                isDragging || isActive,
              "shadow-md": !isDragging && !isActive,
            },
          )}
          style={{
            top: `${50 - value * 2}%`,
            transform: "translateY(-50%)",
            left: "50%",
            marginLeft: "-12px",
          }}
        />
      </div>

      {/* Value Display */}
      <div
        className={cn(
          "text-xs font-mono font-medium transition-colors duration-200",
          {
            "text-eq-accent eq-text-glow": isActive && value !== 0,
            "text-eq-text": !isActive && value !== 0,
            "text-eq-text-dim": value === 0,
          },
        )}
      >
        {value > 0 ? "+" : ""}
        {value.toFixed(1)}dB
      </div>
    </div>
  );
};
