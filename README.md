# Super Dribble Audio Amplifier

A Chrome extension that provides real-time audio amplification and equalization for any tab's audio content.

## Features

- **10-Band Parametric Equalizer**: Fine-tune audio frequencies from 32Hz to 16kHz
- **Volume Control**: Adjust volume levels with real-time feedback
- **Preset Equalizer Settings**: Pre-configured settings for different music genres
- **Real-time Audio Processing**: Process audio from any tab using Web Audio API
- **WebAssembly DSP Engine**: High-performance audio processing using C++ compiled to WASM
- **Lua Preset System**: Dynamic preset loading and management using Lua scripts
- **Spatializer Effects**: Stereo widening and reverb effects for immersive audio
- **Modern UI**: Beautiful, responsive interface with dark theme

## Installation

### Development Mode (Unpacked Extension)

1. Clone this repository:
   ```bash
   git clone https://github.com/BennyPerumalla/Super-dribble.git
   cd Super-dribble
   ```

2. Build the UI:
   ```bash
   cd UI
   npm install
   npm run build
   cd ..
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the root directory of this project

## Usage

1. **Start Audio Capture**:
   - Navigate to any webpage with audio (YouTube, Spotify, etc.)
   - Click the Super Dribble extension icon in your browser toolbar
   - The extension will automatically start capturing audio from the current tab

2. **Adjust Audio Settings**:
   - **Volume**: Use the volume slider to adjust overall volume
   - **Equalizer**: Drag the frequency band sliders to boost or cut specific frequencies
   - **Presets**: Select from pre-configured equalizer settings (Rock, Pop, Jazz, etc.)
   - **Mute**: Click the mute button to quickly silence audio

3. **Real-time Processing**:
   - All changes are applied in real-time
   - The spectrum analyzer shows visual feedback of the audio
   - Settings persist until you change them or close the extension

## Technical Details

### Architecture

- **Background Script** (`background.js`): Handles audio capture and processing using Web Audio API
- **Content Script** (`content.js`): Injected into web pages to ensure extension presence
- **UI** (`UI/`): React-based popup interface with TypeScript
- **Audio Processing**: 10-band parametric equalizer with biquad filters

### Audio Processing Chain

```
Tab Audio → MediaStreamSource → GainNode → BiquadFilter1 → ... → BiquadFilter10 → WASM DSP → Destination
```

### WebAssembly Integration

The extension uses WebAssembly for high-performance audio processing:

- **Equalizer WASM**: 16-band parametric equalizer with biquad filters
- **Spatializer WASM**: Stereo widening and FDN reverb effects
- **Lua Preset System**: Dynamic preset loading using Fengari Lua VM

### Lua Preset System

Presets are defined in Lua format for maximum flexibility:

- **Equalizer Presets**: Frequency, gain, and Q factor for each band
- **Spatializer Presets**: Width, decay, damping, and mix parameters
- **Import/Export**: Save and load custom presets in Lua format

### Permissions

- `activeTab`: Access to the currently active tab
- `tabCapture`: Capture audio from browser tabs

## Development

### Project Structure

```
Super-dribble/
├── manifest.json              # Extension manifest
├── background.js              # Service worker for audio processing
├── content.js                # Content script
├── icons/                    # Extension icons
├── wasm/                     # WebAssembly modules
│   ├── equalizer/
│   │   ├── equalizer.cpp     # C++ equalizer implementation
│   │   ├── equalizer.wasm    # Compiled WASM module
│   │   ├── equalizer.js      # JavaScript glue code
│   │   └── presets.lua       # Equalizer presets
│   └── spatializer/
│       ├── spatializer.cpp   # C++ spatializer implementation
│       ├── spatializer.wasm  # Compiled WASM module
│       ├── spatializer.js    # JavaScript glue code
│       └── spatializer_presets.lua # Spatializer presets
├── utils/
│   └── lua-preset-parser.js  # Lua preset parser
├── lua/
│   └── fengari.min.js        # Lua VM for preset parsing
├── UI/                       # React UI application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── lib/             # Utilities and services
│   │   └── types/           # TypeScript declarations
│   └── build/               # Compiled UI files
├── README.md                # Project documentation
├── INSTALLATION.md          # Installation guide
├── build-wasm.js           # WASM build script
└── verify-extension.js     # Extension verification script
```

### Building

#### UI Build

To rebuild the UI after changes:

```bash
cd UI
npm run build
```

#### WASM Build

To build the WebAssembly modules (requires Emscripten):

```bash
# Install Emscripten first: https://emscripten.org/docs/getting_started/downloads.html
node build-wasm.js
```

If Emscripten is not available, placeholder files will be created automatically.

### Testing

1. Load the extension in Chrome
2. Open a tab with audio content
3. Click the extension icon
4. Test all controls and verify audio changes

## Troubleshooting

### Audio Not Working

1. Ensure the webpage has audio content
2. Check that the extension has permission to capture tab audio
3. Verify the extension is loaded in Chrome
4. Check the browser console for error messages

### Extension Not Loading

1. Ensure all files are present in the project directory
2. Verify the manifest.json is valid
3. Check that the UI has been built (`UI/build/` directory exists)
4. Reload the extension in Chrome

## License

This project is licensed under the GNU Lesser General Public License v2.1.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Author

Benny Perumalla <benny01r@gmail.com>
Irshad Siddi <mohammadirshadsiddi@gmail.com>
