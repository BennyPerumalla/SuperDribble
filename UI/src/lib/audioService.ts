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

  // Initialize audio capture
  async startCapture(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error('No active tab found');
      }

      const response = await chrome.runtime.sendMessage({
        action: 'start_capture',
        tabId: tabs[0].id
      });

      if (response.success) {
        this.isInitialized = true;
        console.log('Audio capture started successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to start audio capture');
      }
    } catch (error) {
      console.error('Error starting audio capture:', error);
      return false;
    }
  }

  // Stop audio capture
  async stopCapture(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'stop_capture'
      });

      if (response.success) {
        this.isInitialized = false;
        console.log('Audio capture stopped successfully');
        return true;
      } else {
        throw new Error(response.error || 'Failed to stop audio capture');
      }
    } catch (error) {
      console.error('Error stopping audio capture:', error);
      return false;
    }
  }

  // Update volume
  async updateVolume(volume: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'update_parameter',
        parameter: 'volume',
        value: volume
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update volume');
      }
      return true;
    } catch (error) {
      console.error('Error updating volume:', error);
      return false;
    }
  }

  // Update mute state
  async updateMute(isMuted: boolean, previousVolume: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'update_parameter',
        parameter: 'mute',
        value: isMuted,
        previousVolume: previousVolume
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update mute state');
      }
      return true;
    } catch (error) {
      console.error('Error updating mute state:', error);
      return false;
    }
  }

  // Update individual EQ band
  async updateEQBand(bandIndex: number, gainDb: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'update_parameter',
        parameter: 'eq_band',
        bandIndex: bandIndex,
        gainDb: gainDb
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update EQ band');
      }
      return true;
    } catch (error) {
      console.error('Error updating EQ band:', error);
      return false;
    }
  }

  // Update EQ preset
  async updateEQPreset(preset: EQPreset): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Chrome extension APIs not available');
      return false;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'update_parameter',
        parameter: 'eq_preset',
        values: preset.values
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to update EQ preset');
      }
      return true;
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
