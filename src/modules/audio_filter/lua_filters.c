/* lua_filters.c */
#include <stdio.h>
#include <stdlib.h>
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

// Function prototypes
void apply_lua_filter(const char *script_path, float *audio_data, int num_samples);

// Main function for testing
int main() {
    printf("Lua Filters Module\n");
    return 0;
}

// Implementation of Lua filter application
void apply_lua_filter(const char *script_path, float *audio_data, int num_samples) {
    lua_State *L = luaL_newstate();
    luaL_openlibs(L);

    if (luaL_dofile(L, script_path) != LUA_OK) {
        fprintf(stderr, "Error loading Lua script: %s\n", lua_tostring(L, -1));
        lua_close(L);
        return;
    }

    lua_getglobal(L, "process_audio");
    if (!lua_isfunction(L, -1)) {
        fprintf(stderr, "Lua script does not define 'process_audio' function\n");
        lua_close(L);
        return;
    }

    lua_pushlightuserdata(L, audio_data);
    lua_pushinteger(L, num_samples);

    if (lua_pcall(L, 2, 0, 0) != LUA_OK) {
        fprintf(stderr, "Error running Lua script: %s\n", lua_tostring(L, -1));
    }

    lua_close(L);
}
