# 🎧 Super-Dribble: Real-Time Audio Enhancement Extension

**Super-Dribble** is a powerful, browser-based audio extension that brings real-time audio processing to Chrome/Brave users. It delivers an immersive listening experience through advanced **equalizer** and **spatializer** filters powered by **WebAssembly (WASM)** and **C/C++ DSP code**. The extension also supports dynamic Lua-scripted preset import/export for full customization.


## 🚀 Features

### 🎚️ 16-Band Equalizer

* Real-time audio filtering using high-performance C++ DSP compiled to WASM.
* User-adjustable 16-band control with smooth sliders.
* Toggle between:

  * Built-in EQ presets (Rock, Jazz, Classical, etc.)
  * Custom presets imported via `.lua` scripts.
* Export current EQ configuration to Lua format.

### 🌌 Spatializer

* Adds stereo widening, room reverb, and 3D simulation effects.
* Toggle between built-in spatial presets and customizable parameter control.
* Controlled using Poweramp-style UI variables (e.g., depth, width, presence).

### 🗂️ Lua Preset Library

* Each filter maintains its own dedicated preset library.
* Lua presets support structured data (e.g., gain per band/frequency).
* Lua interpreted in-browser using Fengari (Lua VM in JS/Web).

### 💡 Poweramp-Inspired UI

* Smooth, animated UI mimicking Poweramp's control panel.
* Built in modern HTML/CSS with responsive sliders and toggles.
* Accessible from Chrome Extension popup.

---

## 🛠️ Tech Stack

| Component      | Technology                                        |
| -------------- | ------------------------------------------------- |
| Audio Filters  | C++ → WebAssembly (via Emscripten)                |
| UI             | HTML, CSS, JS (Popup + DOM Control)               |
| Presets Engine | Lua scripts (Fengari VM)                          |
| Audio Hooking  | Web Audio API + Content Script                    |
| Chrome APIs    | Manifest V3, `chrome.runtime`, `chrome.scripting` |

---

## 📁 Folder Structure

```py
Super-Dribble/
│
├── manifest.json                    # Chrome extension config
├── background.js                    # Service worker logic
├── content.js                       # Injected into tabs, applies audio hooks
├── popup/
│   ├── popup.html                   # UI with sliders & preset toggles
│   ├── popup.css                    # Poweramp-like visual styling
│   └── popup.js                     # Handles UI and messaging
│
├── icons/                           # Extension icon assets
│   └── icon128.png
│
├── wasm/
│   ├── equalizer/
│   │   ├── equalizer.cpp            # 16-band EQ filter logic
│   │   ├── equalizer.wasm
│   │   ├── equalizer.js             # JS glue for WASM
│   │   └── presets.lua              # Built-in presets
│   ├── spatializer/
│   │   ├── spatializer.cpp          # Spatial effect logic (reverb, stereo widening)
│   │   ├── spatializer.wasm
│   │   ├── spatializer.js
│   │   └── presets.lua
│
├── lua/
│   ├── fengari.min.js               # Lua VM (fengari or lua.vm.js)
│   ├── parser.js                    # Parse/import/export Lua presets
│
├── utils/
│   ├── eq-controller.js             # JS control layer for EQ
│   ├── spatial-controller.js       # JS control for spatializer
│   └── preset-utils.js             # Helper functions to convert JS ⇄ Lua
│
└── README.md
```

---

## 📌 How to Use

1. Load the unpacked extension from `chrome://extensions`.
2. Open any website that plays audio.
3. Click the Super-Dribble icon → Adjust EQ/spatializer settings.
4. Import or export presets using Lua files from the popup.

---

## 🧪 Dev Notes

* **WASM build** via Emscripten:

  ```bash
  emcc equalizer.cpp -o equalizer.js -s MODULARIZE=1 -s ENVIRONMENT=web -s EXPORTED_FUNCTIONS="['_process']"
  ```
* Use `chrome.runtime.sendMessage` to communicate between popup and content scripts.
* Lua parser is embedded using Fengari: [https://fengari.io](https://fengari.io)

---

## 🔮 Future Enhancements

* Visualizer for waveform and frequency spectrum.
* Advanced preset manager with user profiles.
* Audio recording & playback options.
* Dark mode toggle.

---

## 👨‍💻 Author & Credits

Built by audio engineering and web extension enthusiasts.
Inspired by Poweramp’s iconic DSP control aesthetics.

---


## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to report issues, request features, and submit pull requests.

## License

This project is licensed under the [MIT License](LICENSE) (or specify another, e.g., GPL/LGPL if required by VLC integration).
