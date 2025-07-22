/**
 * @file parser.js
 * @description Provides functions to parse, validate, and convert presets
 * between Lua and JSON formats using the Fengari Lua VM.
 *
 * This module acts as the bridge between the human-readable .lua preset files
 * and the JavaScript/JSON objects used by the extension's UI and background logic.
 *
 * Usage Example:
 *
 * import { lauxlib, lua, lualib } from './fengari.min.js';
 * import { parseLuaPresets, presetsToLua } from './parser.js';
 *
 * const luaCode = `
 * presets = {{ name = "Flat", bands = {{...}} }}
 * spatial_presets = {{ name = "Studio Room", params = {...} }}`;
 *
 * try {
 * const jsonPresets = parseLuaPresets(luaCode);
 * console.log(jsonPresets.equalizer[0].name); // "Flat"
 *
 * const newLuaCode = presetsToLua(jsonPresets);
 * console.log(newLuaCode);
 * } catch (e) {
 * console.error("Preset parsing failed:", e.message);
 * }
 */

import { lauxlib, lua, lualib, to_jsstring } from './fengari.min.js';

/**
 * Converts a Lua table (at a given stack index) to a JavaScript object.
 * A recursive function that handles nested tables.
 * @param {lua_State} L - The Fengari Lua state.
 * @param {number} index - The stack index of the table.
 * @returns {Object|Array} - The JavaScript representation of the Lua table.
 */
const luaTableToJs = (L, index) => {
    lua.lua_checkstack(L, 2); // Ensure stack space
    index = lua.lua_absindex(L, index);
    const result = {};
    let isArray = true;
    let arrayLen = 0;

    lua.lua_pushnil(L); // First key
    while (lua.lua_next(L, index) !== 0) {
        const key = lua.lua_tostring(L, -2);
        const valueType = lua.lua_type(L, -1);
        let value;

        switch (valueType) {
            case lua.LUA_TNUMBER:
                value = lua.lua_tonumber(L, -1);
                break;
            case lua.LUA_TSTRING:
                value = to_jsstring(lua.lua_tostring(L, -1));
                break;
            case lua.LUA_TBOOLEAN:
                value = lua.lua_toboolean(L, -1);
                break;
            case lua.LUA_TTABLE:
                value = luaTableToJs(L, -1); // Recurse for nested tables
                break;
            default:
                value = null; // Ignore other types like functions
        }

        // Check if the table is an array-like sequence
        const numKey = Number(key);
        if (isArray && !isNaN(numKey) && numKey === arrayLen + 1) {
            if (!Array.isArray(result)) {
               // This is the first numeric key, convert object to array
               const oldResult = result;
               result = [];
               Object.keys(oldResult).forEach(k => result[Number(k)-1] = oldResult[k]);
            }
            result.push(value);
            arrayLen++;
        } else {
            isArray = false;
            if (Array.isArray(result)) {
                // We found a non-sequential or non-numeric key, convert back to object
                const oldResult = result;
                result = {};
                oldResult.forEach((v, i) => result[i+1] = v);
            }
            result[key] = value;
        }

        lua.lua_pop(L, 1); // Pop value, keep key for next iteration
    }
    return result;
};


/**
 * Parses a string of Lua code to extract equalizer and spatializer presets.
 * @param {string} luaString - The string containing the Lua preset definitions.
 * @returns {{equalizer: Object[], spatializer: Object[]}} - An object containing arrays of presets.
 * @throws {Error} If Lua code is invalid or presets are malformed.
 */
export const parseLuaPresets = (luaString) => {
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    // Execute the Lua script
    const status = lauxlib.luaL_dostring(L, lua.to_luastring(luaString));
    if (status !== lua.LUA_OK) {
        const error = to_jsstring(lua.lua_tostring(L, -1));
        lua.lua_close(L);
        throw new Error(`Lua Error: ${error}`);
    }

    // Extract 'presets' table (Equalizer)
    lua.lua_getglobal(L, lua.to_luastring("presets"));
    const equalizerPresets = lua.lua_istable(L, -1) ? luaTableToJs(L, -1) : [];
    lua.lua_pop(L, 1);

    // Extract 'spatial_presets' table (Spatializer)
    lua.lua_getglobal(L, lua.to_luastring("spatial_presets"));
    const spatializerPresets = lua.lua_istable(L, -1) ? luaTableToJs(L, -1) : [];
    lua.lua_pop(L, 1);

    lua.lua_close(L);

    // Basic validation
    if (!Array.isArray(equalizerPresets)) {
        throw new Error("Validation failed: 'presets' must be an array-like table.");
    }
    if (!Array.isArray(spatializerPresets)) {
        throw new Error("Validation failed: 'spatial_presets' must be an array-like table.");
    }

    return {
        equalizer: equalizerPresets,
        spatializer: spatializerPresets,
    };
};

/**
 * Converts a JS object/value to a Lua string representation.
 * @param {*} value - The JavaScript value.
 * @param {number} indentLevel - The current indentation level for pretty printing.
 * @returns {string} - The Lua string representation.
 */
const jsToLuaString = (value, indentLevel = 1) => {
    const indent = "  ".repeat(indentLevel);
    const parentIndent = "  ".repeat(indentLevel - 1);

    if (typeof value === 'string') {
        return `"${value.replace(/"/g, '\\"')}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (value === null || value === undefined) {
        return "nil";
    }
    if (Array.isArray(value)) {
        const items = value.map(item => `${indent}${jsToLuaString(item, indentLevel + 1)}`).join(',\n');
        return `{\n${items}\n${parentIndent}}`;
    }
    if (typeof value === 'object') {
        const items = Object.entries(value)
            .map(([k, v]) => `${indent}${k} = ${jsToLuaString(v, indentLevel + 1)}`)
            .join(',\n');
        return `{\n${items}\n${parentIndent}}`;
    }
    return "nil"; // Default fallback
};

/**
 * Converts a JSON-like object of presets back into a formatted Lua script string.
 * @param {{equalizer: Object[], spatializer: Object[]}} presetsObject - The object containing presets.
 * @returns {string} - A human-readable Lua script.
 */
export const presetsToLua = (presetsObject) => {
    let luaScript = "-- Auto-generated by Super-Dribble Preset Parser\n\n";

    if (presetsObject.equalizer && Array.isArray(presetsObject.equalizer)) {
        luaScript += "presets = ";
        luaScript += jsToLuaString(presetsObject.equalizer);
        luaScript += "\n\n";
    }

    if (presetsObject.spatializer && Array.isArray(presetsObject.spatializer)) {
        luaScript += "spatial_presets = ";
        luaScript += jsToLuaString(presetsObject.spatializer);
        luaScript += "\n";
    }

    return luaScript;
};
