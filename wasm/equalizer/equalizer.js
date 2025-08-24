/*****************************************************************************
 * equalizer.js: JavaScript glue for the equalizer WASM module
 *****************************************************************************
 * Copyright (C) 2024 Benny Perumalla
 *
 * Author: Benny Perumalla <benny01r@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
 *****************************************************************************/

export class EqualizerWASM {
    constructor() {
        this.exports = null;
        this.memory = null;
        this.heapF32 = null;
        this.equalizer = null;
        this.sampleRate = 44100;
        this.isLoaded = false;
        this.audioBuffer = null;
        this.bufferSize = 4096;
    }

    /**
     * Initialize the WASM module
     * @param {number} sampleRate - Audio sample rate
     * @returns {Promise<boolean>} - Success status
     */
    async initialize(sampleRate = 44100) {
        try {
            this.sampleRate = sampleRate;
            
            // Load the WASM module
            this.exports = await this.loadWASMModule();
            
            // Create the equalizer instance
            const create = this._getExport('create_equalizer');
            this.equalizer = create(sampleRate);
            
            // Allocate audio buffer
            this.memory = this.exports.memory;
            this.heapF32 = new Float32Array(this.memory.buffer);
            const malloc = this._getExport('malloc');
            this.audioBuffer = malloc(this.bufferSize * 4); // 4 bytes per float
            
            this.isLoaded = true;
            console.log('Equalizer WASM module loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Equalizer WASM:', error);
            return false;
        }
    }

    /**
     * Load the WASM module using dynamic import
     * @returns {Promise<Object>} - The WASM module
     */
    async loadWASMModule() {
        // For Chrome extension, we need to load from the extension's path
        const wasmPath = chrome.runtime.getURL('wasm/equalizer/equalizer.wasm');
        
        let result;
        const imports = { env: { abort: () => console.error('WASM abort') } };
        const response = await fetch(wasmPath);
        if (WebAssembly.instantiateStreaming) {
            try {
                result = await WebAssembly.instantiateStreaming(response, imports);
            } catch (_) {
                const bytes = await (await fetch(wasmPath)).arrayBuffer();
                result = await WebAssembly.instantiate(bytes, imports);
            }
        } else {
            const bytes = await response.arrayBuffer();
            result = await WebAssembly.instantiate(bytes, imports);
        }
        return result.instance.exports;
    }

    _getExport(name) {
        // try both plain and underscored
        return this.exports[name] || this.exports[`_${name}`];
    }

    /**
     * Set parameters for a specific EQ band
     * @param {number} bandIndex - Band index (0-15)
     * @param {number} frequency - Center frequency in Hz
     * @param {number} gainDb - Gain in decibels
     * @param {number} q - Q factor
     */
    setBand(bandIndex, frequency, gainDb, q) {
        if (!this.isLoaded || !this.equalizer) {
            console.warn('Equalizer not initialized');
            return;
        }
        
        const setBand = this._getExport('set_band');
        setBand(this.equalizer, bandIndex, frequency, gainDb, q);
    }

    /**
     * Process an audio buffer
     * @param {Float32Array} buffer - Input/output audio buffer
     * @param {number} numSamples - Number of samples to process
     */
    processBuffer(buffer, numSamples) {
        if (!this.isLoaded || !this.equalizer || !this.audioBuffer) {
            console.warn('Equalizer not initialized');
            return;
        }

        // Copy input data to WASM memory
        for (let i = 0; i < numSamples; i++) {
            this.heapF32[(this.audioBuffer >> 2) + i] = buffer[i];
        }

        // Process the buffer
        const process = this._getExport('process_buffer');
        process(this.equalizer, this.audioBuffer, numSamples);

        // Copy processed data back
        for (let i = 0; i < numSamples; i++) {
            buffer[i] = this.heapF32[(this.audioBuffer >> 2) + i];
        }
    }

    /**
     * Load and apply a preset from Lua
     * @param {Object} preset - Preset object with bands array
     */
    loadPreset(preset) {
        if (!preset || !preset.bands) {
            console.warn('Invalid preset format');
            return;
        }

        preset.bands.forEach((band, index) => {
            if (index < 16) { // Ensure we don't exceed 16 bands
                this.setBand(index, band.frequency, band.gain, band.q);
            }
        });
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.equalizer) {
            const destroy = this._getExport('destroy_equalizer');
            destroy(this.equalizer);
            this.equalizer = null;
        }
        
        if (this.audioBuffer) {
            const freeFn = this._getExport('free');
            freeFn(this.audioBuffer);
            this.audioBuffer = null;
        }
        
        this.isLoaded = false;
    }

    /**
     * Get the loaded status
     * @returns {boolean} - Whether the module is loaded
     */
    isModuleLoaded() {
        return this.isLoaded;
    }
}

// ESM export only. Background service worker imports this as a module.
