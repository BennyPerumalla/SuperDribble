/*****************************************************************************
 * spatializer.js: JavaScript glue for the spatializer WASM module
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

export class SpatializerWASM {
    constructor() {
        this.exports = null;
        this.memory = null;
        this.heapF32 = null;
        this.spatializer = null;
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
            
            // Create the spatializer instance
            const create = this._getExport('create_spatializer');
            this.spatializer = create(sampleRate);
            
            // Allocate audio buffer for stereo (2 channels)
            this.memory = this.exports.memory;
            this.heapF32 = new Float32Array(this.memory.buffer);
            const malloc = this._getExport('malloc');
            this.audioBuffer = malloc(this.bufferSize * 8); // 8 bytes per stereo frame
            
            this.isLoaded = true;
            console.log('Spatializer WASM module loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Spatializer WASM:', error);
            return false;
        }
    }

    /**
     * Load the WASM module using dynamic import
     * @returns {Promise<Object>} - The WASM module
     */
    async loadWASMModule() {
        // For Chrome extension, we need to load from the extension's path
        const wasmPath = chrome.runtime.getURL('wasm/spatializer/spatializer.wasm');
        
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
        return this.exports[name] || this.exports[`_${name}`];
    }

    /**
     * Set stereo width parameter
     * @param {number} width - Stereo width (1.0 = normal, >1 = wider)
     */
    setWidth(width) {
        if (!this.isLoaded || !this.spatializer) {
            console.warn('Spatializer not initialized');
            return;
        }
        
        const fn = this._getExport('spatializer_set_width');
        fn(this.spatializer, width);
    }

    /**
     * Set reverb decay parameter
     * @param {number} decay - Decay time (0-1)
     */
    setDecay(decay) {
        if (!this.isLoaded || !this.spatializer) {
            console.warn('Spatializer not initialized');
            return;
        }
        
        const fn = this._getExport('spatializer_set_decay');
        fn(this.spatializer, decay);
    }

    /**
     * Set high-frequency damping parameter
     * @param {number} damping - HF damping (0-1)
     */
    setDamping(damping) {
        if (!this.isLoaded || !this.spatializer) {
            console.warn('Spatializer not initialized');
            return;
        }
        
        const fn = this._getExport('spatializer_set_damping');
        fn(this.spatializer, damping);
    }

    /**
     * Set dry/wet mix parameter
     * @param {number} mix - Dry/wet mix (0-1)
     */
    setMix(mix) {
        if (!this.isLoaded || !this.spatializer) {
            console.warn('Spatializer not initialized');
            return;
        }
        
        const fn = this._getExport('spatializer_set_mix');
        fn(this.spatializer, mix);
    }

    /**
     * Process a stereo audio buffer
     * @param {Float32Array} buffer - Interleaved stereo buffer (L, R, L, R, ...)
     * @param {number} numFrames - Number of stereo frames
     */
    processBuffer(buffer, numFrames) {
        if (!this.isLoaded || !this.spatializer || !this.audioBuffer) {
            console.warn('Spatializer not initialized');
            return;
        }

        // Copy input data to WASM memory
        for (let i = 0; i < numFrames * 2; i++) {
            this.heapF32[(this.audioBuffer >> 2) + i] = buffer[i];
        }

        // Process the buffer
        const process = this._getExport('spatializer_process_buffer');
        process(this.spatializer, this.audioBuffer, numFrames);

        // Copy processed data back
        for (let i = 0; i < numFrames * 2; i++) {
            buffer[i] = this.heapF32[(this.audioBuffer >> 2) + i];
        }
    }

    /**
     * Load and apply a preset from Lua
     * @param {Object} preset - Preset object with params
     */
    loadPreset(preset) {
        if (!preset || !preset.params) {
            console.warn('Invalid preset format');
            return;
        }

        const { width, decay, damping, mix } = preset.params;
        
        if (width !== undefined) this.setWidth(width);
        if (decay !== undefined) this.setDecay(decay);
        if (damping !== undefined) this.setDamping(damping);
        if (mix !== undefined) this.setMix(mix);
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.spatializer) {
            const destroy = this._getExport('destroy_spatializer');
            destroy(this.spatializer);
            this.spatializer = null;
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
