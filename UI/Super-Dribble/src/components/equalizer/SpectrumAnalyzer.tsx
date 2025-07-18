import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SpectrumAnalyzerProps {
  isPlaying: boolean;
  className?: string;
}

export const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  isPlaying,
  className,
}) => {
  const [bars, setBars] = useState<number[]>(new Array(64).fill(0));

  useEffect(() => {
    let animationId: number;

    const animateBars = () => {
      if (isPlaying) {
        setBars((prevBars) => prevBars.map(() => Math.random() * 100));
      } else {
        setBars((prevBars) => prevBars.map((bar) => Math.max(0, bar - 5)));
      }
      animationId = requestAnimationFrame(animateBars);
    };

    if (isPlaying) {
      animateBars();
    } else {
      // Gradually fade out bars when not playing
      const fadeOut = () => {
        setBars((prevBars) => {
          const newBars = prevBars.map((bar) => Math.max(0, bar - 2));
          const hasActiveBars = newBars.some((bar) => bar > 0);
          if (hasActiveBars) {
            animationId = requestAnimationFrame(fadeOut);
          }
          return newBars;
        });
      };
      fadeOut();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying]);

  return (
    <div
      className={cn(
        "flex items-end justify-center gap-1 h-24 px-4 rounded-lg",
        "bg-gradient-to-t from-eq-surface to-eq-surface-light",
        "border border-eq-border",
        className,
      )}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "bg-gradient-to-t from-eq-frequency-bar to-eq-accent-glow",
            "rounded-sm transition-all duration-75 ease-out",
            "min-h-1",
            {
              "shadow-sm shadow-eq-accent-glow/30": height > 50,
            },
          )}
          style={{
            height: `${Math.max(4, height)}%`,
            width: "3px",
          }}
        />
      ))}
    </div>
  );
};
