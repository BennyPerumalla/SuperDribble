#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building WebAssembly modules for Super Dribble...\n');

// Check if Emscripten is available
function checkEmscripten() {
    try {
        execSync('emcc --version', { stdio: 'pipe' });
        return true;
    } catch (error) {
        return false;
    }
}

// Build equalizer WASM
function buildEqualizer() {
    console.log('📦 Building Equalizer WASM module...');
    
    const equalizerCpp = path.join(__dirname, 'wasm/equalizer/equalizer.cpp');
    const equalizerWasm = path.join(__dirname, 'wasm/equalizer/equalizer.wasm');
    const equalizerJs = path.join(__dirname, 'wasm/equalizer/equalizer.js');
    
    const command = [
        'emcc',
        `"${equalizerCpp}"`,
        '-o', `"${equalizerWasm}"`,
        '-s', 'MODULARIZE=1',
        '-s', 'ENVIRONMENT=web',
        '-s', 'STANDALONE_WASM=1',
        '-s', 'EXPORTED_FUNCTIONS=["_create_equalizer","_destroy_equalizer","_set_band","_process_buffer","_malloc","_free"]',
        '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","cwrap"]',
        '-s', 'ALLOW_MEMORY_GROWTH=1',
        '-s', 'INITIAL_MEMORY=16777216', // 16MB
        '-s', 'MAXIMUM_MEMORY=67108864', // 64MB
        '-O2', // Optimization level
        '--no-entry'
    ].join(' ');
    
    try {
        execSync(command, { stdio: 'inherit' });
        console.log('✅ Equalizer WASM built successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to build Equalizer WASM:', error.message);
        return false;
    }
}

// Build spatializer WASM
function buildSpatializer() {
    console.log('📦 Building Spatializer WASM module...');
    
    const spatializerCpp = path.join(__dirname, 'wasm/spatializer/spatializer.cpp');
    const spatializerWasm = path.join(__dirname, 'wasm/spatializer/spatializer.wasm');
    const spatializerJs = path.join(__dirname, 'wasm/spatializer/spatializer.js');
    
    const command = [
        'emcc',
        `"${spatializerCpp}"`,
        '-o', `"${spatializerWasm}"`,
        '-s', 'MODULARIZE=1',
        '-s', 'ENVIRONMENT=web',
        '-s', 'STANDALONE_WASM=1',
        '-s', 'EXPORTED_FUNCTIONS=["_create_spatializer","_destroy_spatializer","_spatializer_set_width","_spatializer_set_decay","_spatializer_set_damping","_spatializer_set_mix","_spatializer_process_buffer","_malloc","_free"]',
        '-s', 'EXPORTED_RUNTIME_METHODS=["ccall","cwrap"]',
        '-s', 'ALLOW_MEMORY_GROWTH=1',
        '-s', 'INITIAL_MEMORY=16777216', // 16MB
        '-s', 'MAXIMUM_MEMORY=67108864', // 64MB
        '-O2', // Optimization level
        '--no-entry'
    ].join(' ');
    
    try {
        execSync(command, { stdio: 'inherit' });
        console.log('✅ Spatializer WASM built successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to build Spatializer WASM:', error.message);
        return false;
    }
}

// Create placeholder WASM files if Emscripten is not available
function createPlaceholderWasm() {
    console.log('⚠️  Emscripten not found. Creating placeholder WASM files...');
    
    // Create placeholder equalizer WASM
    const equalizerWasmPath = path.join(__dirname, 'wasm/equalizer/equalizer.wasm');
    if (!fs.existsSync(equalizerWasmPath)) {
        fs.writeFileSync(equalizerWasmPath, '');
        console.log('📄 Created placeholder equalizer.wasm');
    }
    
    // Create placeholder spatializer WASM
    const spatializerWasmPath = path.join(__dirname, 'wasm/spatializer/spatializer.wasm');
    if (!fs.existsSync(spatializerWasmPath)) {
        fs.writeFileSync(spatializerWasmPath, '');
        console.log('📄 Created placeholder spatializer.wasm');
    }
    
    console.log('⚠️  Note: Placeholder files created. Install Emscripten for full functionality.');
    console.log('📖 Install Emscripten: https://emscripten.org/docs/getting_started/downloads.html');
}

// Main build function
function buildWasm() {
    console.log('🔍 Checking build environment...');
    
    if (!checkEmscripten()) {
        createPlaceholderWasm();
        return;
    }
    
    console.log('✅ Emscripten found. Building WASM modules...\n');
    
    let success = true;
    
    // Build equalizer
    if (!buildEqualizer()) {
        success = false;
    }
    
    console.log(''); // Empty line for spacing
    
    // Build spatializer
    if (!buildSpatializer()) {
        success = false;
    }
    
    console.log('\n📊 Build Summary:');
    if (success) {
        console.log('🎉 All WASM modules built successfully!');
        console.log('\n📁 Generated files:');
        console.log('  ├── wasm/equalizer/equalizer.wasm');
        console.log('  ├── wasm/equalizer/equalizer.js');
        console.log('  ├── wasm/spatializer/spatializer.wasm');
        console.log('  └── wasm/spatializer/spatializer.js');
    } else {
        console.log('❌ Some modules failed to build. Check the errors above.');
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Load the extension in Chrome');
    console.log('2. Test the WASM modules in the extension');
    console.log('3. Check browser console for any loading errors');
}

// Run the build
if (require.main === module) {
    buildWasm();
}

module.exports = { buildWasm, checkEmscripten };
