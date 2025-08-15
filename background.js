// Global audio processing state
let audioContext = null;
let audioStream = null;
let sourceNode = null;
let gainNode = null;
let eqNodes = [];
let isProcessing = false;

// WASM modules
let equalizerWasm = null;
let spatializerWasm = null;
let luaParser = null;

// Frequency bands for the 10-band equalizer
const FREQUENCY_BANDS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

// Initialize WASM modules
async function initializeWASM() {
    try {
        // Load WASM modules
        const { EqualizerWASM } = await import(chrome.runtime.getURL('wasm/equalizer/equalizer.js'));
        const { SpatializerWASM } = await import(chrome.runtime.getURL('wasm/spatializer/spatializer.js'));
        const { LuaPresetParser } = await import(chrome.runtime.getURL('utils/lua-preset-parser.js'));
        
        // Initialize equalizer WASM
        equalizerWasm = new EqualizerWASM();
        await equalizerWasm.initialize(44100);
        
        // Initialize spatializer WASM
        spatializerWasm = new SpatializerWASM();
        await spatializerWasm.initialize(44100);
        
        // Initialize Lua parser
        luaParser = new LuaPresetParser();
        await luaParser.initialize();
        
        console.log('WASM modules initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize WASM modules:', error);
        return false;
    }
}

// Initialize audio processing
function initializeAudioProcessing(stream) {
  if (audioContext) {
    audioContext.close();
  }

  audioContext = new AudioContext();
  audioStream = stream;
  sourceNode = audioContext.createMediaStreamSource(stream);

  // Create gain node for volume control
  gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.75, audioContext.currentTime); // Default 75% volume

  // Create 10 biquad filter nodes for equalizer bands
  eqNodes = FREQUENCY_BANDS.map(frequency => {
    const filter = audioContext.createBiquadFilter();
    filter.type = 'peaking';
    filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filter.Q.setValueAtTime(1.0, audioContext.currentTime);
    filter.gain.setValueAtTime(0, audioContext.currentTime); // Start flat
    return filter;
  });

  // Connect the audio graph: source -> gain -> eq1 -> eq2 -> ... -> eq10 -> destination
  let currentNode = sourceNode;
  currentNode.connect(gainNode);
  currentNode = gainNode;
  
  eqNodes.forEach(filter => {
    currentNode.connect(filter);
    currentNode = filter;
  });
  
  currentNode.connect(audioContext.destination);
  
  isProcessing = true;
  console.log('Audio processing initialized');
}

// Start audio capture from the active tab
async function startAudioCapture(tabId) {
  if (isProcessing) {
    console.log('Audio already being processed');
    return;
  }

  // Initialize WASM modules if not already done
  if (!equalizerWasm || !spatializerWasm) {
    await initializeWASM();
  }

  chrome.tabCapture.capture({ 
    audio: true, 
    video: false 
  }, (stream) => {
    if (chrome.runtime.lastError) {
      console.error('Tab capture error:', chrome.runtime.lastError);
      return;
    }
    
    if (!stream) {
      console.error('No audio stream received');
      return;
    }

    initializeAudioProcessing(stream);
  });
}

// Stop audio processing
function stopAudioProcessing() {
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }
  
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  
  sourceNode = null;
  gainNode = null;
  eqNodes = [];
  isProcessing = false;
  
  console.log('Audio processing stopped');
}

// Handle messages from the popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Received message:', request);

  switch (request.action) {
    case 'start_capture':
      startAudioCapture(request.tabId);
      sendResponse({ success: true });
      break;

    case 'stop_capture':
      stopAudioProcessing();
      sendResponse({ success: true });
      break;

    case 'update_parameter':
      if (!audioContext || !isProcessing) {
        sendResponse({ success: false, error: 'Audio not initialized' });
        return;
      }

      try {
        switch (request.parameter) {
          case 'volume':
            const volumeValue = request.value / 100; // Convert percentage to 0-1
            gainNode.gain.setValueAtTime(volumeValue, audioContext.currentTime);
            break;

          case 'mute':
            const muteValue = request.value ? 0 : (request.previousVolume || 75) / 100;
            gainNode.gain.setValueAtTime(muteValue, audioContext.currentTime);
            break;

          case 'eq_band':
            const { bandIndex, gainDb } = request;
            if (bandIndex >= 0 && bandIndex < eqNodes.length) {
              eqNodes[bandIndex].gain.setValueAtTime(gainDb, audioContext.currentTime);
            }
            break;

          case 'eq_preset':
            const { values } = request;
            if (values && values.length === eqNodes.length) {
              values.forEach((gainDb, index) => {
                eqNodes[index].gain.setValueAtTime(gainDb, audioContext.currentTime);
              });
            }
            break;

          default:
            console.warn('Unknown parameter:', request.parameter);
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error updating parameter:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'get_status':
      sendResponse({ 
        isProcessing, 
        isInitialized: !!audioContext,
        bandsCount: eqNodes.length,
        wasmLoaded: !!(equalizerWasm && spatializerWasm),
        luaParserLoaded: !!luaParser
      });
      break;

    case 'load_lua_presets':
      if (!luaParser) {
        sendResponse({ success: false, error: 'Lua parser not initialized' });
        return;
      }

      try {
        const presetType = request.presetType; // 'equalizer' or 'spatializer'
        let presets = [];
        
        if (presetType === 'equalizer') {
          presets = await luaParser.loadEqualizerPresets();
        } else if (presetType === 'spatializer') {
          presets = await luaParser.loadSpatializerPresets();
        }
        
        sendResponse({ success: true, presets });
      } catch (error) {
        console.error('Error loading Lua presets:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    case 'apply_lua_preset':
      if (!equalizerWasm || !spatializerWasm) {
        sendResponse({ success: false, error: 'WASM modules not initialized' });
        return;
      }

      try {
        const { presetType, preset } = request;
        
        if (presetType === 'equalizer' && equalizerWasm) {
          equalizerWasm.loadPreset(preset);
        } else if (presetType === 'spatializer' && spatializerWasm) {
          spatializerWasm.loadPreset(preset);
        }
        
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error applying Lua preset:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;

    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }

  return true; // Keep the message channel open for async response
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Super Dribble Audio Amplifier installed');
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Super Dribble Audio Amplifier started');
});

// Clean up when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  stopAudioProcessing();
});
