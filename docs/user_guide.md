# User Guide - Advanced VLC Audio Filters

This guide explains how to use the advanced audio filters included in this project once they are installed in VLC Media Player.

*(Note: The exact menu paths might vary slightly depending on the VLC version and operating system.)*

## Accessing Audio Filters

1.  Open VLC Media Player.
2.  Go to the main menu: `Tools` -> `Effects and Filters` (or `Window` -> `Audio Effects...` on macOS).
3.  Navigate to the `Audio Effects` tab.
4.  You should find sub-tabs or sections for the newly added filters (e.g., "3D Audio", "Upmixing", "Track Mixer", "Lua Filters", "LADSPA").

## 1. Enabling 3D Audio

1.  In the `Audio Effects` window, find the section or checkbox related to "3D Audio" or "Spatializer".
2.  Enable the filter by checking the box.
3.  Adjust the available parameters:
    * **Stereo Widening:** Controls the perceived width of the stereo soundstage.
    * **Bass Enhancement:** Adjusts the level of low-frequency boost.
    * **(Optional) Effect Strength:** A general control for the overall intensity of the 3D effect.
4.  Listen to the changes in real-time.

## 2. Using Dolby Prologic-II Upmixing

1.  Find the "Upmixing" or "Prologic-II" section in the `Audio Effects` window.
2.  Enable the filter.
3.  Select the desired upmixing mode:
    * **Movie Mode:** Recommended for films and TV shows to enhance dialogue and surround ambience.
    * **Music Mode:** Suitable for stereo music playback, providing a balanced surround experience. You might find additional controls here like:
        * *Center Width:* Adjusts how much sound is directed to the center speaker vs. front left/right.
        * *Panorama:* Creates a broader front soundstage effect.
4.  Ensure your speaker setup in VLC's Audio preferences (Tools -> Preferences -> Audio -> Output -> Speaker configuration) is set to 5.1 or appropriate surround layout to hear the effect correctly.

## 3. Configuring Track Mixing (If Applicable)

*(Note: The exact interface for track mixing might depend heavily on final implementation - it might be part of track selection rather than a standard audio filter.)*

* Look for controls related to multiple audio tracks if playing media with them.
* You might find options for:
    * **Volume:** Sliders to adjust the level of each individual track.
    * **Pan:** Controls to position each track in the stereo/surround field.
    * **Transitions:** Options to enable/disable or configure crossfades if switching between tracks or sources.

## 4. Using Custom Lua Filters

1.  Navigate to the "Lua Filters" section in the `Audio Effects` window.
2.  Enable the Lua filter processing.
3.  Click a "Load Script" or "Browse" button.
4.  Select a `.lua` audio filter script (e.g., from the `examples/lua_filters/` directory or one you've written).
5.  The script will be loaded and applied to the audio stream.
6.  Some scripts might expose their own parameters within the VLC interface if designed to do so.
7.  To disable, uncheck the main Lua filter enable box or unload the script.

## 5. Loading LADSPA Plugins

1.  Ensure you are running on a Linux system where LADSPA plugins are installed correctly (often in `/usr/lib/ladspa` or `~/.ladspa`).
2.  Go to the "LADSPA" section in the `Audio Effects` window.
3.  Enable LADSPA plugin hosting.
4.  You should see an option to "Scan for Plugins" or a list of detected plugins.
5.  Select a desired LADSPA plugin from the list.
6.  Once loaded, the plugin's controllable parameters should appear as sliders or input fields. Adjust them as needed.
7.  You might be able to chain multiple LADSPA plugins if the implementation supports it.
