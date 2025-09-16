import { AudioEqualizer } from "@/components/equalizer/AudioEqualizer";
import { LuaPresetManager } from "@/components/equalizer/LuaPresetManager";
import { AudioSpatializer } from "@/components/spatializer/AudioSpatializer";

const Index = () => {
  return (
    <div className="min-h-screen bg-eq-background p-4 md:p-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-eq-accent/20 via-transparent to-eq-accent/10" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, hsla(var(--eq-accent-glow), 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, hsla(var(--eq-accent-glow), 0.1) 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AudioEqualizer className="animate-fade-in" />
            <LuaPresetManager />
          </div>
          <div className="space-y-6">
            <AudioSpatializer className="animate-fade-in [animation-delay:150ms]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
