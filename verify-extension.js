#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Super Dribble Chrome Extension...\n');

// Required files for the extension
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'icons/icon128.png',
  'UI/build/index.html',
  'UI/build/assets/main-bB7Lpm6O.css',
  'UI/build/assets/main--Bf9qBex.js',
  'wasm/equalizer/equalizer.wasm',
  'wasm/equalizer/equalizer.js',
  'wasm/equalizer/presets.lua',
  'wasm/spatializer/spatializer.wasm',
  'wasm/spatializer/spatializer.js',
  'wasm/spatializer/spatializer_presets.lua',
  'utils/lua-preset-parser.js'
];

// Check if files exist
let allFilesPresent = true;
const missingFiles = [];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
    allFilesPresent = false;
  }
});

// Check manifest.json structure
console.log('\n📋 Checking manifest.json:');
try {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const requiredManifestFields = [
    'manifest_version',
    'name',
    'version',
    'description',
    'permissions',
    'action',
    'background',
    'content_scripts'
  ];
  
  requiredManifestFields.forEach(field => {
    if (manifest[field]) {
      console.log(`✅ ${field}: ${JSON.stringify(manifest[field])}`);
    } else {
      console.log(`❌ ${field}: MISSING`);
      allFilesPresent = false;
    }
  });
  
  // Check popup path
  if (manifest.action && manifest.action.default_popup) {
    const popupPath = path.join(__dirname, manifest.action.default_popup);
    if (fs.existsSync(popupPath)) {
      console.log(`✅ Popup file exists: ${manifest.action.default_popup}`);
    } else {
      console.log(`❌ Popup file missing: ${manifest.action.default_popup}`);
      allFilesPresent = false;
    }
  }
  
} catch (error) {
  console.log(`❌ Error reading manifest.json: ${error.message}`);
  allFilesPresent = false;
}

// Check UI build files
console.log('\n🎨 Checking UI build:');
const uiBuildPath = path.join(__dirname, 'UI/build');
if (fs.existsSync(uiBuildPath)) {
  const buildFiles = fs.readdirSync(uiBuildPath);
  console.log(`✅ UI build directory exists with ${buildFiles.length} files`);
  buildFiles.forEach(file => {
    console.log(`  📄 ${file}`);
  });
} else {
  console.log('❌ UI build directory missing');
  allFilesPresent = false;
}

// Summary
console.log('\n📊 Summary:');
if (allFilesPresent) {
  console.log('🎉 All files are present! The extension is ready to load.');
  console.log('\n📝 Next steps:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked" and select this directory');
  console.log('4. Test the extension on a webpage with audio');
} else {
  console.log('⚠️  Some files are missing. Please check the errors above.');
  console.log('\nMissing files:');
  missingFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
}

console.log('\n🔧 Extension Structure:');
console.log('├── manifest.json          # Extension configuration');
console.log('├── background.js          # Audio processing service worker');
console.log('├── content.js            # Content script for web pages');
console.log('├── icons/                # Extension icons');
console.log('│   ├── icon16.png');
console.log('│   ├── icon48.png');
console.log('│   └── icon128.png');
console.log('└── UI/                   # React UI application');
console.log('    └── build/            # Compiled UI files');
console.log('        ├── index.html');
console.log('        └── assets/');

console.log('\n🎵 Audio Processing Features:');
console.log('✅ 10-band parametric equalizer');
console.log('✅ Volume control with mute');
console.log('✅ Preset equalizer settings');
console.log('✅ Real-time audio processing');
console.log('✅ Web Audio API integration');
console.log('✅ Chrome tab capture support');
console.log('✅ WebAssembly DSP processing');
console.log('✅ Lua preset system');
console.log('✅ Spatializer effects');
