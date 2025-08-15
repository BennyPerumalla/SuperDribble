#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Building Super Dribble Chrome Extension...\n');

// Check if UI build exists
const uiBuildPath = path.join(__dirname, 'UI/build');
if (!fs.existsSync(uiBuildPath)) {
    console.log('📦 Building UI...');
    const { execSync } = require('child_process');
    try {
        execSync('npm run build', { cwd: path.join(__dirname, 'UI'), stdio: 'inherit' });
        console.log('✅ UI built successfully');
    } catch (error) {
        console.error('❌ UI build failed:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ UI build already exists');
}

// Check required files
const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'UI/build/index.html',
    'wasm/equalizer/equalizer.wasm',
    'wasm/equalizer/equalizer.js',
    'wasm/equalizer/presets.lua',
    'wasm/spatializer/spatializer.wasm',
    'wasm/spatializer/spatializer.js',
    'wasm/spatializer/spatializer_presets.lua',
    'utils/lua-preset-parser.js',
    'lua/fengari.min.js',
    'icons/icon128.png'
];

console.log('\n🔍 Verifying required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 0) {
            console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
        } else {
            console.log(`⚠️  ${file} (empty file)`);
            allFilesExist = false;
        }
    } else {
        console.log(`❌ ${file} (missing)`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing or empty.');
    console.log('Please run the following commands:');
    console.log('1. Build WASM modules: & "$Env:EMSDK_NODE" .\\build-wasm.js');
    console.log('2. Build UI: cd UI && npm run build');
    process.exit(1);
}

// Create a simple extension package info
const packageInfo = {
    name: 'Super Dribble',
    version: '1.0.0',
    description: 'Advanced audio equalizer and spatializer Chrome extension',
    buildDate: new Date().toISOString(),
    features: [
        'WebAssembly DSP Engine',
        'Lua Preset System',
        '16-band Parametric Equalizer',
        'Spatializer Effects',
        'Real-time Audio Processing'
    ]
};

fs.writeFileSync(path.join(__dirname, 'extension-info.json'), JSON.stringify(packageInfo, null, 2));

console.log('\n🎉 Extension build completed successfully!');
console.log('\n📋 To load in Chrome:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in top right)');
console.log('3. Click "Load unpacked"');
console.log('4. Select this directory: ' + __dirname);
console.log('5. The extension should appear in your extensions list');
console.log('6. Click the extension icon to open the equalizer interface');
console.log('\n🔧 Extension Info:');
console.log(`   Name: ${packageInfo.name}`);
console.log(`   Version: ${packageInfo.version}`);
console.log(`   Build Date: ${new Date(packageInfo.buildDate).toLocaleString()}`);
console.log(`   Features: ${packageInfo.features.length} active`);
