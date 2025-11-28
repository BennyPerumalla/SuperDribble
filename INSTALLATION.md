# Installation Guide - Super Dribble Audio Amplifier

## Prerequisites

- Google Chrome browser (version 88 or later)
- Node.js (version 16 or later) - for building the UI
- npm (comes with Node.js)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BennyPerumalla/Super-dribble.git
cd Super-dribble
```

### 2. Build the UI

The extension uses a React-based UI that needs to be built before loading:

```bash
cd UI
npm install
npm run build
cd ..
```

This creates the `UI/build/` directory with the compiled UI files.

### 3. Load the Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top-right corner
4. Click "Load unpacked"
5. Select the root directory of the Super-dribble project
6. The extension should now appear in your extensions list

### 4. Verify Installation

1. Look for the "Super Dribble Audio Amplifier" extension in your extensions list
2. The extension icon should appear in your Chrome toolbar
3. If the icon is not visible, click the puzzle piece icon in the toolbar and pin the extension

## First Use

### 1. Start Audio Capture

1. Open any webpage that plays audio (YouTube, Spotify, SoundCloud, etc.)
2. Start playing audio on the page
3. Click the Super Dribble extension icon in your toolbar
4. The extension popup will open and automatically start capturing audio

### 2. Adjust Audio Settings

- **Volume**: Use the volume slider to adjust overall volume
- **Equalizer**: Drag the frequency band sliders to boost or cut specific frequencies
- **Presets**: Select from pre-configured equalizer settings
- **Mute**: Click the mute button to quickly silence audio

## Troubleshooting

### Extension Won't Load

**Problem**: The extension doesn't appear in Chrome's extension list.

**Solutions**:
1. Ensure all files are present in the project directory
2. Verify that `UI/build/` directory exists and contains files
3. Check that `manifest.json` is in the root directory
4. Try reloading the extension in `chrome://extensions/`

### Audio Not Working

**Problem**: The extension loads but doesn't affect audio.

**Solutions**:
1. Ensure the webpage has active audio content
2. Check that the extension has permission to capture tab audio
3. Look for error messages in the browser console (F12 → Console)
4. Try refreshing the webpage and restarting audio

### Build Errors

**Problem**: `npm run build` fails with errors.

**Solutions**:
1. Ensure Node.js version 16+ is installed
2. Delete `node_modules/` and run `npm install` again
3. Check that all dependencies are properly installed
4. Verify TypeScript compilation errors are resolved

### Permission Issues

**Problem**: Chrome asks for additional permissions.

**Solutions**:
1. The extension needs `activeTab` and `tabCapture` permissions
2. These are standard permissions for audio processing extensions
3. Grant the permissions when prompted

## Development Mode

For developers who want to modify the extension:

### Rebuilding After Changes

After making changes to the UI:

```bash
cd UI
npm run build
cd ..
```

Then reload the extension in `chrome://extensions/`.

### Debugging

1. Open the extension popup
2. Right-click and select "Inspect"
3. Use the developer tools to debug the UI
4. Check the background script logs in the extension's service worker

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "Super Dribble Audio Amplifier"
3. Click "Remove"
4. Confirm the removal

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Look for error messages in the browser console
3. Verify all installation steps were followed correctly
4. Check the project's GitHub issues page for known problems

## System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Browser**: Google Chrome 88+ or Chromium-based browsers
- **Memory**: At least 4GB RAM recommended
- **Storage**: 50MB free space for the extension

## Security Notes

- The extension only captures audio from tabs you explicitly visit
- No audio data is transmitted to external servers
- All processing happens locally in your browser
- The extension requires tab capture permissions to function
