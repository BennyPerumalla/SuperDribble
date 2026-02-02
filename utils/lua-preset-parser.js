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
     * @returns {Promise<boolean>}
     */
    async initialize() {
        if (this.isLoaded) return true; // Prevent re-initialization

        try {
            // Check if fengari is already in global scope (optimization)
            // @ts-ignore
            if (self.fengari || window.fengari) {
                // @ts-ignore
                this.fengari = self.fengari || window.fengari;
            } else {
                const fengariPath = chrome.runtime.getURL('lua/fengari.min.js');
                const src = await (await fetch(fengariPath)).text();
                // eslint-disable-next-line no-new-func
                new Function(src)();
                // @ts-ignore
                this.fengari = self.fengari || window.fengari;
            }
            
            if (!this.fengari) throw new Error("Fengari failed to load into global scope");

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
     * @param {string} luaContent 
     * @param {string} presetType 
     * @returns {Array} 
     */
    parsePresets(luaContent, presetType) {
        if (!this.isLoaded || !this.fengari) {
            console.warn('Lua parser not initialized');
            return [];
        }

        const L = this.fengari.luaL_newstate();
        if (!L) return [];

        try {
            this.fengari.luaL_openlibs(L);

            // Execute the Lua code
            if (this.fengari.luaL_dostring(L, luaContent) !== 0) {
                const error = this.fengari.lua_tostring(L, -1);
                console.error('Lua execution error:', error);
                return [];
            }

            // Get the specific global table
            const tableName = presetType === 'equalizer' ? 'presets' : 'spatial_presets';
            this.fengari.lua_getglobal(L, tableName);

            if (!this.fengari.lua_istable(L, -1)) {
                console.warn(`Table '${tableName}' not found or is not a table.`);
                return [];
            }

            // Parse result and cleanup
            const presets = this.parseLuaTable(L, -1);
            return presets;

        } catch (error) {
            console.error('Error parsing Lua presets:', error);
            return [];
        } finally {
            // Always close state to prevent memory leaks
            this.fengari.lua_close(L);
        }
    }

    /**
     * Parse a Lua table into a JS object/array safely
     * @param {Object} L 
     * @param {number} index 
     * @returns {Array|Object} 
     */
    parseLuaTable(L, index) {
        // CRITICAL FIX: Convert relative index to absolute index.
        // Pushing nil for lua_next changes relative offsets, so we must anchor 't'.
        let t = index;
        if (t < 0) {
            t = this.fengari.lua_gettop(L) + (index + 1);
        }

        const result = {};
        let isArray = true;
        let maxIndex = 0;
        
        // Push nil to start iteration
        this.fengari.lua_pushnil(L);
        
        while (this.fengari.lua_next(L, t) !== 0) {
            // Stack: table(t), key(-2), value(-1)

            // CRITICAL FIX: Duplicate key before processing.
            // lua_tostring (used in luaValueToJS) can change the key type in-place 
            // from Number to String, which breaks lua_next.
            this.fengari.lua_pushvalue(L, -2); // Stack: table, key, value, key_copy
            
            const key = this.luaValueToJS(L, -1);
            this.fengari.lua_pop(L, 1);        // Pop key_copy. Stack: table, key, value
            
            const value = this.luaValueToJS(L, -1);
            
            // Logic to determine if this is an array or object
            if (typeof key === 'number' && Number.isInteger(key) && key > 0) {
                result[key - 1] = value; // Lua is 1-based
                maxIndex = Math.max(maxIndex, key);
            } else {
                isArray = false;
                result[key] = value;
            }
            
            this.fengari.lua_pop(L, 1); // Pop value, keep key for next iteration
        }

        // Return array if it looked like a sequence, otherwise object
        if (isArray && maxIndex > 0) {
            return Array.from({ ...result, length: maxIndex });
        }
        return isArray && maxIndex === 0 ? [] : result;
    }

    /**
     * Convert a Lua value to JavaScript
     * @param {Object} L 
     * @param {number} index 
     * @returns {any} 
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
                // Use to_jsstring if available or decoder to handle UTF-8 correctly
                const s = this.fengari.lua_tostring(L, index);
                return s ? new TextDecoder().decode(s) : ""; 
            case this.fengari.LUA_TTABLE:
                return this.parseLuaTable(L, index);
            default:
                // Handle Functions/Userdata gracefully to avoid crash
                return null;
        }
    }

    /**
     * Load equalizer presets
     */
    async loadEqualizerPresets() {
        return this.loadPresetFile('wasm/equalizer/presets.lua', 'equalizer');
    }

    /**
     * Load spatializer presets
     */
    async loadSpatializerPresets() {
        return this.loadPresetFile('wasm/spatializer/spatializer_presets.lua', 'spatializer');
    }

    /**
     * Generic file loader helper
     */
    async loadPresetFile(path, type) {
        try {
            const url = chrome.runtime.getURL(path);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const luaContent = await response.text();
            return this.parsePresets(luaContent, type);
        } catch (error) {
            console.error(`Failed to load ${type} presets:`, error);
            return [];
        }
    }

    /**
     * Export a preset to Lua format
     */
    exportPresetToLua(preset, presetType) {
        if (!preset) return '';
        if (presetType === 'equalizer') return this.exportEqualizerPreset(preset);
        if (presetType === 'spatializer') return this.exportSpatializerPreset(preset);
        return '';
    }

    exportEqualizerPreset(preset) {
        const lines = [
            `{`,
            `  name = "${preset.name || 'Custom'}",`,
            preset.description ? `  description = "${preset.description}",` : null,
            `  bands = {`
        ].filter(Boolean);

        if (Array.isArray(preset.bands)) {
            const bandLines = preset.bands.map(b => 
                `    { frequency = ${b.frequency}, gain = ${b.gain}, q = ${b.q || 1.0} }`
            );
            lines.push(bandLines.join(',\n'));
        }

        lines.push(`  }`, `}`);
        return lines.join('\n');
    }

    exportSpatializerPreset(preset) {
        const p = preset.params || {};
        return [
            `{`,
            `  name = "${preset.name || 'Custom'}",`,
            preset.description ? `  description = "${preset.description}",` : null,
            `  params = {`,
            `    width = ${p.width || 0},`,
            `    decay = ${p.decay || 0},`,
            `    damping = ${p.damping || 0},`,
            `    mix = ${p.mix || 0}`,
            `  }`,
            `}`
        ].filter(Boolean).join('\n');
    }

    isParserLoaded() {
        return this.isLoaded;
    }
}

// ESM export only. Background service worker imports this as a module.
