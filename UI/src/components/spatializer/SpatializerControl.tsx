import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SpatializerControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

export const SpatializerControl: React.FC<SpatializerControlProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  className,
  formatValue = (v) => v.toFixed(2),
  disabled = false,
}) => {
  return (
    <div className={cn("flex flex-col items-center space-y-2 w-20", className, {
      'opacity-50 pointer-events-none': disabled
    })}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="h-40 w-full flex items-center justify-center">
        <Slider
          orientation="vertical"
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([val]) => onChange(val)}
          className="h-32"
          disabled={disabled}
        />
      </div>
      <span className={cn("text-xs font-mono w-full text-center", {
        'text-muted-foreground': disabled
      })}>
        {formatValue(value)}
      </span>
    </div>
  );
};

export default SpatializerControl;
