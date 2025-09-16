// Audio service for communicating with the background script

export interface AudioStatus {
  isProcessing: boolean;
  isInitialized: boolean;
  bandsCount: number;
}

export interface EQPreset {
  name: string;
  values: number[];
}

interface MediaInfo {
  isPlaying: boolean;
  title: string;
  artist?: string;
  album?: string;
  appName: string;
  duration?: number;
  position?: number;
}

class AudioService {
  private isInitialized = false;
  private capturedTabId: number | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private eqNodes: BiquadFilterNode[] = [];
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private reverbGainNode: GainNode | null = null;
  private dryGainNode: GainNode | null = null;
  private spatialParams = {
    width: 1.0,
    decay: 0.5,
    damping: 0.5,
    mix: 0.3,
    enabled: false
  };

  // Check if running in a Chrome extension context with necessary APIs
  public isAvailable(): boolean {
    return typeof chrome !== 'undefined' && 
           typeof chrome.runtime !== 'undefined' && 
           typeof chrome.runtime.sendMessage !== 'undefined';
  }

  // Process audio stream in the popup
  private processAudioInPopup(stream: MediaStream): void {
    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContext();
      }

      // Create source node from the stream
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0; // Default volume

      // Create EQ nodes (5-band equalizer)
      const frequencies = [60, 230, 910, 4000, 14000]; // EQ band frequencies
      this.eqNodes = frequencies.map(freq => {
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.gain.value = 0; // Start flat
        return filter;
      });

      // Create panner for spatial audio
      this.pannerNode = this.audioContext.createStereoPanner();
      this.pannerNode.pan.value = 0; // Center position

      // Create convolver for reverb
      this.convolverNode = this.audioContext.createConvolver();
      
      // Create gain nodes for wet/dry mix
      this.reverbGainNode = this.audioContext.createGain();
      this.dryGainNode = this.audioContext.createGain();
      this.reverbGainNode.gain.value = 0.3; // Default reverb mix
      this.dryGainNode.gain.value = 0.7;   // Default dry mix

      // Connect nodes in the audio graph
      let lastNode: AudioNode = this.sourceNode;
      
      // Connect through EQ nodes
      this.eqNodes.forEach(node => {
        lastNode.connect(node);
        lastNode = node;
      });

      // Split to dry and wet paths
      lastNode.connect(this.dryGainNode!);
      lastNode.connect(this.reverbGainNode!);
      
      // Connect reverb
      this.reverbGainNode.connect(this.convolverNode!);
      this.convolverNode!.connect(this.audioContext.destination);
      
      // Connect dry path
      this.dryGainNode!.connect(this.audioContext.destination);

      // Set up impulse response for reverb (simple impulse by default)
      const sampleRate = this.audioContext.sampleRate;
      const length = 2 * sampleRate; // 2 seconds
      const impulse = this.audioContext.createBuffer(2, length, sampleRate);
      const leftChannel = impulse.getChannelData(0);
      const rightChannel = impulse.getChannelData(1);
      
      // Simple impulse response
      for (let i = 0; i < length; i++) {
        const n = i / sampleRate;
        leftChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 3);
        rightChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 3);
      }
      
      this.convolverNode.buffer = impulse;
      
    } catch (error) {
      console.error('Error setting up audio processing:', error);
      this.cleanupAudioNodes();
      throw error;
    }
  }

  // Clean up audio nodes and resources
  private cleanupAudioNodes(): void {
    // Stop all audio tracks in the source node
    if (this.sourceNode?.mediaStream) {
      this.sourceNode.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Disconnect and clear audio nodes
    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close();
    }

    // Clear references
    this.sourceNode = null;
    this.gainNode = null;
    this.eqNodes = [];
    this.pannerNode = null;
    this.convolverNode = null;
    this.reverbGainNode = null;
    this.dryGainNode = null;
    this.audioContext = null;
  }


  private async sendMessageToTab<T = any>(message: any, tabId?: number | null): Promise<T> {
    const ensureTabId = async () => {
      if (tabId) return tabId;
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0]?.id ?? null;
    };

    const targetTabId = await ensureTabId();
    if (!targetTabId) throw new Error('No active tab available');

    // Wrap callback-style API to Promise for reliability across Chrome versions
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore sendMessage callback signature
        chrome.tabs.sendMessage(targetTabId, message, (response: any) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(new Error(err.message));
          } else {
            resolve(response);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Initialize audio capture (must be called from popup, not background script)
  async startCapture(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      console.log('Starting audio capture from popup...');
      
      // First, try to stop any existing capture to prevent conflicts
      await this.stopCapture();
      
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error('No active tab found');
      }

      const tab = tabs[0];
      console.log('Active tab found:', tab.title, tab.url);
      this.capturedTabId = tab.id ?? null;

      // Check if tab is suitable for audio capture
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://'))) {
        throw new Error('Cannot capture audio from browser internal pages');
      }

      // chrome.tabCapture.capture() must be called directly from popup (not background script)
      return new Promise<boolean>((resolve, reject) => {
        // Add a small delay to ensure any previous capture is fully released
        setTimeout(() => {
          chrome.tabCapture.capture({ 
            audio: true, 
            video: false 
          }, (stream) => {
            if (chrome.runtime.lastError) {
              const errorMsg = chrome.runtime.lastError.message || 'Unknown error';
              console.error('Tab capture error:', errorMsg);
              
              // Provide more user-friendly error messages
              if (errorMsg.includes('active stream')) {
                reject(new Error('Cannot capture this tab because it already has an active audio stream. Try a different tab or close other audio applications.'));
              } else if (errorMsg.includes('permission')) {
                reject(new Error('Permission denied. Please allow audio capture in your browser settings.'));
              } else {
                reject(new Error(`Audio capture failed: ${errorMsg}`));
              }
              return;
            }
            
            if (!stream) {
              const errorMsg = 'No audio stream received - make sure the tab has audio content';
              console.error(errorMsg);
              reject(new Error(errorMsg));
              return;
            }

            console.log('Audio stream captured successfully');
            
            try {
              this.processAudioInPopup(stream);
              this.isInitialized = true;
              console.log('Audio capture and processing started successfully');
              resolve(true);
            } catch (error) {
              console.error('Error processing audio in popup:', error);
              this.cleanupAudioNodes();
              reject(error);
            }
          });
        }, 100); // Small delay to ensure previous capture is released
      });
    } catch (error) {
      console.error('Error in startCapture:', error);
      this.cleanupAudioNodes();
      this.isInitialized = false;
      throw error;
    }
  }

  // Create impulse response for reverb
  private async createImpulseResponse(audioContext: AudioContext): Promise<AudioBuffer> {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2; // 2 seconds
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);
    
    // Create a simple impulse response with stereo spread
    for (let i = 0; i < length; i++) {
      const n = i / length;
      const decay = Math.pow(1 - n, 2);
      const noise = (Math.random() * 2 - 1) * 0.1 * decay;
      
      // Left channel with slight delay and pan
      leftChannel[i] = (Math.sin(i * 0.1) * Math.exp(-i / (sampleRate * 1.5)) + noise) * 0.5;
      
      // Right channel with different decay and pan
      rightChannel[i] = (Math.sin(i * 0.12) * Math.exp(-i / (sampleRate * 1.7)) + noise) * 0.5;
    }
    
    return impulse;
  }

  // Update spatialization parameters
  async updateSpatialization(params: {
    width?: number;
    decay?: number;
    damping?: number;
    mix?: number;
    enabled?: boolean;
  }): Promise<boolean> {
    try {
      if (!this.audioContext || !this.pannerNode || !this.reverbGainNode || 
          !this.dryGainNode || !this.convolverNode) {
        return false;
      }
      
      const now = this.audioContext.currentTime;
      
      // Update stored params
      this.spatialParams = {
        ...this.spatialParams,
        ...params
      };
      
      const { width, decay, damping, mix, enabled } = this.spatialParams;
      
      // Apply parameters to audio nodes
      if (this.pannerNode) {
        // Map width (-1 to 1 pan range) to a stereo spread effect
        const pan = Math.min(1, Math.max(-1, (width - 1) * 2));
        this.pannerNode.pan.linearRampToValueAtTime(pan, now + 0.1);
      }
      
      if (this.reverbGainNode) {
        // Adjust reverb mix based on decay and mix parameters
        const wetGain = enabled ? mix * (0.3 + decay * 0.7) : 0;
        const dryGain = 1 - (enabled ? mix * 0.5 : 0);
        
        this.reverbGainNode.gain.linearRampToValueAtTime(wetGain, now + 0.1);
        
        if (this.dryGainNode) {
          this.dryGainNode.gain.linearRampToValueAtTime(dryGain, now + 0.1);
        }
      }
      
      // Update reverb character based on decay and damping
      if (this.convolverNode && this.convolverNode.buffer) {
        // In a real implementation, you would generate different impulse responses
        // based on the decay and damping parameters
        // For now, we'll just adjust the wet/dry mix
      }
      
      return true;
    } catch (error) {
      console.error('Error updating spatialization:', error);
      return false;
    }
  }

  // Stop audio capture and clean up resources
  async stopCapture(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Clean up all audio nodes and resources
      this.cleanupAudioNodes();
      
      // Reset state
      this.isInitialized = false;
      this.capturedTabId = null;

      console.log('Audio capture stopped and resources cleaned up');
      return true;
    } catch (error) {
      console.error('Error stopping audio capture:', error);
      return false;
    }
  }

  // Update volume
  async updateVolume(volume: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Audio not initialized');
      return false;
    }

    try {
      const gainNode = (this as any).gainNode;
      const audioContext = (this as any).audioContext;
      
      if (gainNode && audioContext) {
        const volumeValue = volume / 100; // Convert percentage to 0-1
        gainNode.gain.setValueAtTime(volumeValue, audioContext.currentTime);
        console.log('Volume updated to:', volume + '%');
        return true;
      } else {
        throw new Error('Audio processing not available');
      }
    } catch (error) {
      console.error('Error updating volume:', error);
      return false;
    }
  }

  // Update mute state
  async updateMute(isMuted: boolean, previousVolume: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Audio not initialized');
      return false;
    }

    try {
      const gainNode = (this as any).gainNode;
      const audioContext = (this as any).audioContext;
      
      if (gainNode && audioContext) {
        const muteValue = isMuted ? 0 : (previousVolume / 100);
        gainNode.gain.setValueAtTime(muteValue, audioContext.currentTime);
        console.log('Mute state updated:', isMuted);
        return true;
      } else {
        throw new Error('Audio processing not available');
      }
    } catch (error) {
      console.error('Error updating mute state:', error);
      return false;
    }
  }

  // Update individual EQ band
  async updateEQBand(bandIndex: number, gainDb: number): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Audio not initialized');
      return false;
    }

    try {
      const eqNodes = (this as any).eqNodes;
      const audioContext = (this as any).audioContext;
      
      if (eqNodes && audioContext && bandIndex >= 0 && bandIndex < eqNodes.length) {
        eqNodes[bandIndex].gain.setValueAtTime(gainDb, audioContext.currentTime);
        console.log(`EQ band ${bandIndex} updated to:`, gainDb + 'dB');
        return true;
      } else {
        throw new Error('Audio processing not available or invalid band index');
      }
    } catch (error) {
      console.error('Error updating EQ band:', error);
      return false;
    }
  }

  // Update EQ preset
  async updateEQPreset(preset: EQPreset): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Audio not initialized');
      return false;
    }

    try {
      const eqNodes = (this as any).eqNodes;
      const audioContext = (this as any).audioContext;
      
      if (eqNodes && audioContext && preset.values && preset.values.length === eqNodes.length) {
        preset.values.forEach((gainDb, index) => {
          eqNodes[index].gain.setValueAtTime(gainDb, audioContext.currentTime);
        });
        console.log('EQ preset updated:', preset.name);
        return true;
      } else {
        throw new Error('Audio processing not available or invalid preset');
      }
    } catch (error) {
      console.error('Error updating EQ preset:', error);
      return false;
    }
  }

  // Send playback control command to the captured tab
  async controlPlayback(command: 'toggle' | 'play' | 'pause' | 'next' | 'previous'): Promise<boolean> {
    try {
      // Ensure we have a tab to target
      let tabId = this.capturedTabId;
      if (!tabId) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        tabId = tabs[0]?.id ?? null;
        this.capturedTabId = tabId;
      }
      if (!tabId) throw new Error('No active tab available for playback control');

      const response = await this.sendMessageToTab({
        action: 'media_control',
        command,
      }, tabId);
      return !!(response && (response as any).success);
    } catch (error) {
      console.error('Error sending playback control:', error);
      return false;
    }
  }

  // Get current media info from the captured tab
  async getMediaInfo(): Promise<{
    isPlaying: boolean;
    title: string;
    artist?: string;
    album?: string;
    appName: string;
    duration?: number;
    position?: number;
  } | null> {
    try {
      let tabId = this.capturedTabId;
      if (!tabId) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        tabId = tabs[0]?.id ?? null;
        this.capturedTabId = tabId;
      }
      if (!tabId) throw new Error('No active tab available for media info');

      const response = await this.sendMessageToTab<MediaInfo>({
        action: 'get_media_info'
      }, tabId);
      
      return response;
    } catch (error) {
      console.error('Error getting media info:', error);
      return null;
    }
  }

  getCapturedTabId(): number | null {
    return this.capturedTabId;
  }

  // Get audio processing status
  async getStatus(): Promise<AudioStatus | null> {
    try {
      if (!this.isAvailable()) {
        console.warn('Chrome extension APIs not available');
        return null;
      }

      return {
        isProcessing: this.audioContext?.state === 'running',
        isInitialized: this.isInitialized,
        bandsCount: this.eqNodes.length
      };
    } catch (error) {
      console.error('Error getting audio status:', error);
      return null;
    }
  }

  // Load Lua presets
  async loadLuaPresets(presetType: 'equalizer' | 'spatializer'): Promise<any[]> {
    try {
      // This would typically make an API call to fetch presets
      // For now, return an empty array as a placeholder
      return [];
    } catch (error) {
      console.error(`Error loading ${presetType} presets:`, error);
      return [];
    }
  }

  // Apply Lua preset
  async applyLuaPreset(presetType: 'equalizer' | 'spatializer', preset: any): Promise<boolean> {
    if (!this.isInitialized) {
      console.warn('Audio not initialized');
      return false;
    }

    try {
      const response = await this.sendMessageToTab({
        action: 'apply_lua_preset',
        presetType,
        preset
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to apply Lua preset');
      }
      return true;
    } catch (error) {
      console.error('Error applying Lua preset:', error);
      return false;
    }
  }

  // Get initialization status
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const audioService = new AudioService();
