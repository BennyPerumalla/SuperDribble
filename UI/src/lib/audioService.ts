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

class AudioService {
  private isInitialized = false;

  // Initialize audio capture (must be called from popup, not background script)
  async startCapture(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      console.log('Starting audio capture from popup...');
      
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error('No active tab found');
      }

      const tab = tabs[0];
      console.log('Active tab found:', tab.title, tab.url);

      // Check if tab is suitable for audio capture
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
        throw new Error('Cannot capture audio from browser internal pages');
      }

      // chrome.tabCapture.capture() must be called directly from popup (not background script)
      return new Promise((resolve, reject) => {
        chrome.tabCapture.capture({ 
          audio: true, 
          video: false 
        }, (stream) => {
          if (chrome.runtime.lastError) {
            console.error('Tab capture error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (!stream) {
            console.error('No audio stream received - make sure the tab has audio content');
            reject(new Error('No audio stream received - make sure the tab has audio content'));
            return;
          }

          console.log('Audio stream captured successfully:', stream);
          console.log('Stream tracks:', stream.getTracks().map(track => ({
            kind: track.kind,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          })));

          // Process audio directly in popup (MediaStream can't be transferred to background script)
          this.processAudioInPopup(stream).then(() => {
            this.isInitialized = true;
            console.log('Audio capture and processing started successfully');
            resolve(true);
          }).catch((error) => {
            console.error('Error processing audio in popup:', error);
            reject(error);
          });
        });
      });
    } catch (error) {
      console.error('Error starting audio capture:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Process audio directly in popup (since MediaStream can't be transferred to background script)
  private async processAudioInPopup(stream: MediaStream): Promise<void> {
    try {
      // Create audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create audio processing nodes
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      
      // Set initial volume
      gainNode.gain.setValueAtTime(0.75, audioContext.currentTime);

      // Create equalizer bands
      const frequencyBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
      const eqNodes = frequencyBands.map(frequency => {
        const filter = audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
        filter.Q.setValueAtTime(1.0, audioContext.currentTime);
        filter.gain.setValueAtTime(0, audioContext.currentTime);
        return filter;
      });

      // Connect audio graph
      let currentNode = sourceNode;
      currentNode.connect(gainNode);
      currentNode = gainNode;
      
      eqNodes.forEach(filter => {
        currentNode.connect(filter);
        currentNode = filter;
      });
      
      currentNode.connect(audioContext.destination);

      // Store references for later control
      (this as any).audioContext = audioContext;
      (this as any).gainNode = gainNode;
      (this as any).eqNodes = eqNodes;
      (this as any).sourceNode = sourceNode;

      console.log('Audio processing initialized in popup');
      console.log('Audio context state:', audioContext.state);
      console.log('Sample rate:', audioContext.sampleRate);
      
    } catch (error) {
      console.error('Error processing audio in popup:', error);
      throw error;
    }
  }

  // Stop audio capture
  async stopCapture(): Promise<boolean> {
    try {
      const audioContext = (this as any).audioContext;
      const sourceNode = (this as any).sourceNode;
      
      if (audioContext) {
        // Disconnect all nodes
        if (sourceNode) {
          sourceNode.disconnect();
        }
        
        // Close audio context
        await audioContext.close();
        
        // Clear references
        (this as any).audioContext = null;
        (this as any).gainNode = null;
        (this as any).eqNodes = null;
        (this as any).sourceNode = null;
      }
      
      this.isInitialized = false;
      console.log('Audio capture stopped successfully');
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

  // Get audio processing status
  async getStatus(): Promise<AudioStatus | null> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return null;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'get_status'
      });

      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to get status');
      }
    } catch (error) {
      console.error('Error getting audio status:', error);
      return null;
    }
  }

  // Load Lua presets
  async loadLuaPresets(presetType: 'equalizer' | 'spatializer'): Promise<any[]> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return [];
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'load_lua_presets',
        presetType
      });

      if (response.success) {
        return response.presets || [];
      } else {
        throw new Error(response.error || 'Failed to load Lua presets');
      }
    } catch (error) {
      console.error('Error loading Lua presets:', error);
      return [];
    }
  }

  // Apply Lua preset
  async applyLuaPreset(presetType: 'equalizer' | 'spatializer', preset: any): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const response = await chrome.runtime.sendMessage({
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

  // Check if the service is available (Chrome extension context)
  isAvailable(): boolean {
    return typeof chrome !== 'undefined' && 
           typeof chrome.runtime !== 'undefined' && 
           typeof chrome.runtime.sendMessage !== 'undefined';
  }

  // Get initialization status
  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const audioService = new AudioService();
