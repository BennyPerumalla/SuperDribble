# Technical Documentation - Advanced VLC Audio Filters

## 1. Architecture Overview

This project introduces several new audio filter modules designed to integrate into the VLC media player's audio processing pipeline. Each feature (3D Audio, Prologic-II, Track Mixing, Lua Scripting, LADSPA) is implemented as a distinct audio filter module (`aout_filter`) adhering to VLC's modular architecture.

**(A diagram illustrating how these filters fit into the VLC audio pipeline could be included here eventually.)**

The core idea is to intercept the audio buffer, apply the specific filter's processing, and pass the modified buffer downstream. Configuration parameters for each filter will be exposed through VLC's preferences interface.

## 2. Feature Implementation Details

### 2.1. Immersive 3D Audio (HRTF-based)

* **Module:** `src/modules/audio_filter/3d_audio.c`
* **Algorithm:**
    * Inspired by SRS WoW-like effects.
    * Utilizes Head-Related Transfer Functions (HRTFs) for spatialization. This typically involves convolving the audio signal with selected HRTF impulse responses corresponding to virtual speaker positions.
    * Frequency-dependent filtering and inter-aural time differences (ITDs) / level differences (ILDs) are applied based on the HRTF data.
    * Stereo Widening: Achieved by manipulating phase and level differences between channels (e.g., using specific filtering or cross-mixing techniques).
    * Bass Enhancement: Psychoacoustic bass enhancement techniques might be employed, potentially involving harmonic generation or dynamic range compression on low frequencies.
* **Data:** Requires a set of HRTF data (e.g., from standard databases like CIPIC or MIT KEMAR). The mechanism for loading/selecting HRTFs needs definition.
* **Parameters:** Configurable settings for effect strength, widening amount, bass level.

### 2.2. Dolby Prologic-II Upmixing

* **Module:** `src/modules/audio_filter/prologic_upmix.c`
* **Algorithm:**
    * Implements the Dolby Prologic II matrix decoding process to generate L, C, R, Ls, Rs channels from a stereo (Lt/Rt) input.
    * **Decoding Matrix:** A passive matrix extracts initial channel estimates (e.g., C = L+R, S = L-R).
    * **Steering Logic:** Active, adaptive steering logic analyzes channel content (direction, dominance) to enhance separation and steer sounds accurately. This involves feedback loops and gain adjustments.
    * **Movie Mode:** Employs specific steering parameters optimized for film soundtracks, emphasizing dialogue in the center channel and creating immersive surround effects.
    * **Music Mode:** Uses different parameters suitable for music, providing options for center channel width and panorama effects for a balanced sound field.
* **Parameters:** Selection between Movie and Music modes, potentially center width/panorama adjustments.

### 2.3. Audio Track Mixing and Transitions

* **Module:** `src/modules/audio_filter/track_mixer.c`
    *(Note: This might require interaction with higher-level VLC components managing multiple input streams/tracks, not just a simple filter.)*
* **Features:**
    * **Level Balancing:** Adjusting the gain of individual audio tracks being mixed.
    * **Panning:** Positioning tracks within the stereo or surround field.
    * **Transitions:**
        * *Fade-In/Out:* Applying a gradual gain change (e.g., linear, logarithmic) at the start or end of a track.
        * *Crossfade:* Simultaneously fading out one track while fading in another for a smooth transition between them. Requires access to multiple audio buffers concurrently.
* **Implementation:** Needs careful handling of multiple audio buffers and timing synchronization.

### 2.4. Lua Scripting Framework

* **Module:** `src/modules/audio_filter/lua_filters.c`
* **Architecture:**
    * A C module that embeds a Lua interpreter.
    * Exposes a Lua API to access audio buffer data (e.g., samples, format, channels, sample rate).
    * Provides functions within Lua to modify the audio buffer data.
    * Handles loading and execution of user-provided `.lua` scripts.
* **API Design:**
    * `process_buffer(buffer, num_samples, channels, sample_rate)`: A primary function Lua scripts would implement.
    * Helper functions for common tasks (e.g., getting/setting sample values, basic math operations).
* **Security:** Sandboxing the Lua environment is crucial to prevent malicious scripts.

### 2.5. LADSPA Plugin Integration

* **Module:** `src/modules/audio_filter/ladspa_integration.c`
* **Architecture:**
    * Uses the `ladspa.h` header definitions.
    * Dynamically loads LADSPA plugin shared libraries (`.so` files on Linux).
    * Instantiates plugins using the LADSPA API (`ladspa_instantiate`).
    * Connects plugin ports to audio buffers and control parameters.
    * Calls the plugin's `run` function within the VLC filter processing loop.
    * Manages plugin activation/deactivation.
* **Challenges:** Mapping VLC's audio buffer format to LADSPA ports, handling plugin latency, exposing plugin parameters to the VLC UI.
* **Platform:** Initially Linux. Windows (VST) or macOS (Audio Units) would require separate implementations.

### 2.6. MPlayer Volume Filter Port (Qualification Task)

* **Goal:** Demonstrate understanding of filter porting by adapting MPlayer's `af_volume` filter logic to VLC's audio filter API.
* **Process:** Analyze the MPlayer filter's C code, understand its algorithm (volume scaling, potentially channel-specific adjustments, clipping prevention), and reimplement the same logic using VLC's filter structure (`filter_t`), buffer handling, and configuration methods.
