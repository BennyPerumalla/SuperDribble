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

// @ts-nocheck
/* eslint-disable */

export class LuaPresetParser {
    // Explicitly declare properties to fix TS2339
    private fengari: any = null;
    private isLoaded: boolean = false;

    constructor() {
        this.fengari = null;
        this.isLoaded = false;
    }

    /**
     * Initialize the Lua parser using Fengari
     */
    async initialize(): Promise<boolean> {
        if (this.isLoaded) return true;

        try {
            // Check global scope first
            // @ts-ignore
            if (typeof self !== 'undefined' && (self.fengari || (window && window.fengari))) {
                // @ts-ignore
                this.fengari = self.fengari || (window && window.fengari);
            } else {
                // Fetch from public folder
                // @ts-ignore
                const runtime = (typeof chrome !== 'undefined' ? chrome.runtime : null);
                if (!runtime) throw new Error("Chrome runtime not found");

                const fengariPath = runtime.getURL('lua/fengari.min.js');
                const response = await fetch(fengariPath);
                const src = await response.text();
                
                // eslint-disable-next-line no-new-func
                new Function(src)();
                
                // @ts-ignore
                this.fengari = (typeof self !== 'undefined' ? self.fengari : null) || (typeof window !== 'undefined' ? window.fengari : null);
            }
            
            if (!this.fengari) throw new Error("Fengari failed to load");

            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Lua init failed:', error);
            return false;
        }
    }

    /**
     * Parse Lua content
     */
    parsePresets(luaContent: string, presetType: 'equalizer' | 'spatializer'): any[] {
        if (!this.isLoaded || !this.fengari) return [];

        const L = this.fengari.luaL_newstate();
        if (!L) return [];

        try {
            this.fengari.luaL_openlibs(L);

            if (this.fengari.luaL_dostring(L, luaContent) !== 0) {
                console.error('Lua Error:', this.fengari.lua_tostring(L, -1));
                return [];
            }

            const tableName = presetType === 'equalizer' ? 'presets' : 'spatial_presets';
            this.fengari.lua_getglobal(L, tableName);

            if (!this.fengari.lua_istable(L, -1)) return [];

            return this.parseLuaTable(L, -1);
        } catch (e) {
            console.error(e);
            return [];
        } finally {
            this.fengari.lua_close(L);
        }
    }

    private parseLuaTable(L: any, index: number): any {
        let t = index;
        if (t < 0) t = this.fengari.lua_gettop(L) + (index + 1);

        const result: any = {};
        let isArray = true;
        let maxIndex = 0;
        
        this.fengari.lua_pushnil(L);
        
        while (this.fengari.lua_next(L, t) !== 0) {
            this.fengari.lua_pushvalue(L, -2); // Copy key
            const key = this.luaValueToJS(L, -1);
            this.fengari.lua_pop(L, 1);        // Pop copy
            const value = this.luaValueToJS(L, -1);
            
            if (typeof key === 'number' && Number.isInteger(key) && key > 0) {
                result[key - 1] = value;
                maxIndex = Math.max(maxIndex, key);
            } else {
                isArray = false;
                result[key] = value;
            }
            this.fengari.lua_pop(L, 1); // Pop value
        }

        if (isArray && maxIndex > 0) {
            return Array.from({ ...result, length: maxIndex });
        }
        return isArray && maxIndex === 0 ? [] : result;
    }

    private luaValueToJS(L: any, index: number): any {
        const type = this.fengari.lua_type(L, index);
        switch (type) {
            case this.fengari.LUA_TNIL: return null;
            case this.fengari.LUA_TBOOLEAN: return this.fengari.lua_toboolean(L, index);
            case this.fengari.LUA_TNUMBER: return this.fengari.lua_tonumber(L, index);
            case this.fengari.LUA_TSTRING: 
                const s = this.fengari.lua_tostring(L, index);
                return s ? new TextDecoder().decode(s) : "";
            case this.fengari.LUA_TTABLE: return this.parseLuaTable(L, index);
            default: return null;
        }
    }

    async loadEqualizerPresets() {
        return this.loadPresetFile('wasm/equalizer/presets.lua', 'equalizer');
    }

    async loadSpatializerPresets() {
        return this.loadPresetFile('wasm/spatializer/spatializer_presets.lua', 'spatializer');
    }

    private async loadPresetFile(path: string, type: 'equalizer' | 'spatializer') {
        try {
            // @ts-ignore
            const runtime = (typeof chrome !== 'undefined' ? chrome.runtime : null);
            if (!runtime) return [];

            const url = runtime.getURL(path);
            const response = await fetch(url);
            const text = await response.text();
            return this.parsePresets(text, type);
        } catch (e) {
            console.error(`Load failed for ${path}`, e);
            return [];
        }
    }

    isParserLoaded() {
        return this.isLoaded;
    }
}

// ESM export only. Background service worker imports this as a module.
