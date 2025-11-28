/*****************************************************************************
 * lua-preset-parser.js: Lua preset parser for Super-Dribble
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

export class LuaPresetParser {
    constructor() {
        this.fengari = null;
        this.isLoaded = false;
    }

    /**
     * Initialize the Lua parser using Fengari
     * @returns {Promise<boolean>} - Success status
     */
    async initialize() {
        try {
            // Load Fengari from the extension's path
            const fengariPath = chrome.runtime.getURL('lua/fengari.min.js');
            
            // Dynamic import of Fengari
            // fengari exposes global "fengari" when loaded via <script>. For MV3, we fetch and eval.
            const src = await (await fetch(fengariPath)).text();
            // eslint-disable-next-line no-new-func
            new Function(src)();
            // @ts-ignore
            this.fengari = self.fengari || window.fengari;
            
            this.isLoaded = true;
            console.log('Lua preset parser initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Lua preset parser:', error);
            return false;
        }
    }

    /**
     * Parse a Lua preset file content
     * @param {string} luaContent - The Lua code as a string
     * @param {string} presetType - Type of preset ('equalizer' or 'spatializer')
     * @returns {Array} - Array of parsed presets
     */
    parsePresets(luaContent, presetType) {
        if (!this.isLoaded || !this.fengari) {
            console.warn('Lua parser not initialized');
            return [];
        }

        try {
            // Create a new Lua state
            const L = this.fengari.luaL_newstate();
            this.fengari.luaL_openlibs(L);

            // Load and execute the Lua code
            const result = this.fengari.luaL_dostring(L, luaContent);
            
            if (result !== 0) {
                const error = this.fengari.lua_tostring(L, -1);
                console.error('Lua execution error:', error);
                this.fengari.lua_close(L);
                return [];
            }

            // Get the presets table based on type
            const tableName = presetType === 'equalizer' ? 'presets' : 'spatial_presets';
            this.fengari.lua_getglobal(L, tableName);

            if (!this.fengari.lua_istable(L, -1)) {
                console.error(`Table '${tableName}' not found in Lua code`);
                this.fengari.lua_close(L);
                return [];
            }

            // Parse the presets table
            const presets = this.parseLuaTable(L, -1);
            
            this.fengari.lua_close(L);
            return presets;

        } catch (error) {
            console.error('Error parsing Lua presets:', error);
            return [];
        }
    }

    /**
     * Parse a Lua table into a JavaScript object
     * @param {Object} L - Lua state
     * @param {number} index - Stack index of the table
     * @returns {Array|Object} - Parsed table
     */
    parseLuaTable(L, index) {
        const result = [];
        
        // Push nil to start iteration
        this.fengari.lua_pushnil(L);
        
        while (this.fengari.lua_next(L, index - 1) !== 0) {
            const key = this.luaValueToJS(L, -2);
            const value = this.luaValueToJS(L, -1);
            
            if (typeof key === 'number') {
                // Array-like table
                result[key - 1] = value; // Lua arrays are 1-indexed
            } else {
                // Object-like table
                if (!Array.isArray(result)) {
                    // Convert to object if we haven't seen numeric keys yet
                    result.length = 0;
                    Object.setPrototypeOf(result, Object.prototype);
                }
                result[key] = value;
            }
            
            this.fengari.lua_pop(L, 1);
        }
        
        return result;
    }

    /**
     * Convert a Lua value to JavaScript
     * @param {Object} L - Lua state
     * @param {number} index - Stack index of the value
     * @returns {any} - JavaScript value
     */
    luaValueToJS(L, index) {
        const type = this.fengari.lua_type(L, index);
        
        switch (type) {
            case this.fengari.LUA_TNIL:
                return null;
            case this.fengari.LUA_TBOOLEAN:
                return this.fengari.lua_toboolean(L, index);
            case this.fengari.LUA_TNUMBER:
                return this.fengari.lua_tonumber(L, index);
            case this.fengari.LUA_TSTRING:
                return this.fengari.lua_tostring(L, index);
            case this.fengari.LUA_TTABLE:
                return this.parseLuaTable(L, index);
            default:
                return null;
        }
    }

    /**
     * Load and parse equalizer presets from file
     * @returns {Promise<Array>} - Array of equalizer presets
     */
    async loadEqualizerPresets() {
        try {
            const presetPath = chrome.runtime.getURL('wasm/equalizer/presets.lua');
            const response = await fetch(presetPath);
            const luaContent = await response.text();
            
            return this.parsePresets(luaContent, 'equalizer');
        } catch (error) {
            console.error('Failed to load equalizer presets:', error);
            return [];
        }
    }

    /**
     * Load and parse spatializer presets from file
     * @returns {Promise<Array>} - Array of spatializer presets
     */
    async loadSpatializerPresets() {
        try {
            const presetPath = chrome.runtime.getURL('wasm/spatializer/spatializer_presets.lua');
            const response = await fetch(presetPath);
            const luaContent = await response.text();
            
            return this.parsePresets(luaContent, 'spatializer');
        } catch (error) {
            console.error('Failed to load spatializer presets:', error);
            return [];
        }
    }

    /**
     * Export a preset to Lua format
     * @param {Object} preset - Preset object
     * @param {string} presetType - Type of preset
     * @returns {string} - Lua code string
     */
    exportPresetToLua(preset, presetType) {
        if (presetType === 'equalizer') {
            return this.exportEqualizerPreset(preset);
        } else if (presetType === 'spatializer') {
            return this.exportSpatializerPreset(preset);
        }
        return '';
    }

    /**
     * Export an equalizer preset to Lua
     * @param {Object} preset - Equalizer preset
     * @returns {string} - Lua code
     */
    exportEqualizerPreset(preset) {
        let lua = `{\n  name = "${preset.name}",\n`;
        
        if (preset.description) {
            lua += `  description = "${preset.description}",\n`;
        }
        
        lua += `  bands = {\n`;
        
        preset.bands.forEach((band, index) => {
            lua += `    { frequency = ${band.frequency}, gain = ${band.gain}, q = ${band.q} }`;
            if (index < preset.bands.length - 1) lua += ',';
            lua += '\n';
        });
        
        lua += `  }\n}`;
        return lua;
    }

    /**
     * Export a spatializer preset to Lua
     * @param {Object} preset - Spatializer preset
     * @returns {string} - Lua code
     */
    exportSpatializerPreset(preset) {
        let lua = `{\n  name = "${preset.name}",\n`;
        
        if (preset.description) {
            lua += `  description = "${preset.description}",\n`;
        }
        
        lua += `  params = {\n`;
        lua += `    width = ${preset.params.width},\n`;
        lua += `    decay = ${preset.params.decay},\n`;
        lua += `    damping = ${preset.params.damping},\n`;
        lua += `    mix = ${preset.params.mix}\n`;
        lua += `  }\n}`;
        return lua;
    }

    /**
     * Get the loaded status
     * @returns {boolean} - Whether the parser is loaded
     */
    isParserLoaded() {
        return this.isLoaded;
    }
}

// ESM export only. Background service worker imports this as a module.
