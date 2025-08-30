--*****************************************************************************
-- presets.lua: Comprehensive equalizer presets for Super-Dribble
--*****************************************************************************
-- Copyright (C) 2024 Benny Perumalla
--
-- Author: Benny Perumalla <benny01r@gmail.com>
--
-- This program is free software; you can redistribute it and/or modify it
-- under the terms of the GNU Lesser General Public License as published by
-- the Free Software Foundation; either version 2.1 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
-- GNU Lesser General Public License for more details.
--
-- You should have received a copy of the GNU Lesser General Public License
-- along with this program; if not, write to the Free Software Foundation,
-- Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
--*****************************************************************************

--[[
Enhanced Preset Structure:
-------------------------
- name: Name displayed in the UI
- description: Detailed explanation of the preset's effect
- category: Grouping for UI organization ["Genre", "Utility", "Enhancement", "Device", "Special Effect"]
- tags: Array of relevant keywords for searching and filtering
- author: Creator of the preset (optional)
- version: Version number (optional)
- bands: Array of 16 EQ bands with the following properties:
  - frequency: Center frequency in Hz
  - gain: Boost or cut in decibels (dB)
  - q: Q factor controlling bandwidth (higher = narrower)

The 16 bands are divided into:
- 10 primary bands for UI sliders (indices 1-10)
- 6 supplementary bands for fine-tuning (indices 11-16)
]]

presets = {
    --=============================================
    -- REFERENCE PRESETS
    --=============================================
    {
        name = "Flat",
        description = "Neutral response with no frequency adjustments. Use as a reference point.",
        category = "Utility",
        tags = {"neutral", "reference", "flat", "bypass"},
        version = "1.0",
        bands = {
            { frequency = 31,    gain = 0.0, q = 1.0 },
            { frequency = 62,    gain = 0.0, q = 1.0 },
            { frequency = 125,   gain = 0.0, q = 1.0 },
            { frequency = 250,   gain = 0.0, q = 1.0 },
            { frequency = 500,   gain = 0.0, q = 1.0 },
            { frequency = 1000,  gain = 0.0, q = 1.0 },
            { frequency = 2000,  gain = 0.0, q = 1.0 },
            { frequency = 4000,  gain = 0.0, q = 1.0 },
            { frequency = 8000,  gain = 0.0, q = 1.0 },
            { frequency = 16000, gain = 0.0, q = 1.0 },
            { frequency = 32,    gain = 0.0, q = 1.0 },
            { frequency = 64,    gain = 0.0, q = 1.0 },
            { frequency = 128,   gain = 0.0, q = 1.0 },
            { frequency = 256,   gain = 0.0, q = 1.0 },
            { frequency = 512,   gain = 0.0, q = 1.0 },
            { frequency = 1024,  gain = 0.0, q = 1.0 }
        }
    },

    --=============================================
    -- GENRE PRESETS - ROCK & METAL
    --=============================================
    {
        name = "Rock",
        description = "Enhanced bass and treble for rock music with punchy mids. Ideal for classic and modern rock.",
        category = "Genre",
        tags = {"rock", "guitar", "drums", "classic rock", "modern rock"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = 4.5,  q = 1.2 },
            { frequency = 62,    gain = 3.5,  q = 1.0 },
            { frequency = 125,   gain = 0.5,  q = 1.0 },
            { frequency = 250,   gain = -2.0, q = 1.0 },
            { frequency = 500,   gain = -1.5, q = 1.0 },
            { frequency = 1000,  gain = 1.5,  q = 1.5 },
            { frequency = 2000,  gain = 3.5,  q = 1.8 },
            { frequency = 4000,  gain = 5.5,  q = 2.0 },
            { frequency = 8000,  gain = 6.0,  q = 2.5 },
            { frequency = 16000, gain = 5.0,  q = 2.0 },
            { frequency = 40,    gain = 3.0,  q = 1.0 },
            { frequency = 80,    gain = 2.0,  q = 1.0 },
            { frequency = 160,   gain = -1.0, q = 1.0 },
            { frequency = 320,   gain = -1.5, q = 1.0 },
            { frequency = 640,   gain = 0.0,  q = 1.0 },
            { frequency = 1280,  gain = 2.0,  q = 1.0 }
        }
    },
    {
        name = "Hard Rock",
        description = "Aggressive EQ curve with boosted low mids and high end for hard rock and heavy music.",
        category = "Genre",
        tags = {"rock", "hard rock", "guitar", "aggressive", "heavy"},
        version = "1.0",
        bands = {
            { frequency = 31,    gain = 5.0,  q = 1.1 },
            { frequency = 62,    gain = 4.0,  q = 1.0 },
            { frequency = 125,   gain = 2.0,  q = 1.0 },
            { frequency = 250,   gain = -1.0, q = 1.2 },
            { frequency = 500,   gain = -3.0, q = 1.5 },
            { frequency = 1000,  gain = 0.0,  q = 1.0 },
            { frequency = 2000,  gain = 3.0,  q = 1.2 },
            { frequency = 4000,  gain = 6.0,  q = 1.5 },
            { frequency = 8000,  gain = 7.0,  q = 1.8 },
            { frequency = 16000, gain = 6.0,  q = 1.5 },
            { frequency = 42,    gain = 4.5,  q = 1.1 },
            { frequency = 90,    gain = 3.0,  q = 1.0 },
            { frequency = 180,   gain = 1.0,  q = 1.0 },
            { frequency = 350,   gain = -2.0, q = 1.2 },
            { frequency = 700,   gain = -1.0, q = 1.3 },
            { frequency = 1400,  gain = 1.5,  q = 1.2 }
        }
    },
    {
        name = "Metal",
        description = "Scooped mids with emphasized low end and high end for metal music. Brings out guitar distortion and drum attack.",
        category = "Genre",
        tags = {"metal", "heavy", "guitar", "drums", "aggressive", "scooped"},
        version = "1.0",
        bands = {
            { frequency = 31,    gain = 6.0,  q = 0.9 },
            { frequency = 62,    gain = 5.0,  q = 0.9 },
            { frequency = 125,   gain = 3.0,  q = 1.0 },
            { frequency = 250,   gain = 0.0,  q = 1.0 },
            { frequency = 500,   gain = -4.0, q = 1.4 },
            { frequency = 1000,  gain = -5.0, q = 1.5 },
            { frequency = 2000,  gain = 0.0,  q = 1.0 },
            { frequency = 4000,  gain = 5.0,  q = 1.5 },
            { frequency = 8000,  gain = 7.0,  q = 1.8 },
            { frequency = 16000, gain = 6.0,  q = 1.5 },
            { frequency = 45,    gain = 5.5,  q = 0.9 },
            { frequency = 100,   gain = 2.5,  q = 1.0 },
            { frequency = 175,   gain = 1.0,  q = 1.0 },
            { frequency = 750,   gain = -4.5, q = 1.5 },
            { frequency = 1500,  gain = -2.0, q = 1.3 },
            { frequency = 3000,  gain = 3.0,  q = 1.2 }
        }
    },

    --=============================================
    -- GENRE PRESETS - POP & ELECTRONIC
    --=============================================
    {
        name = "Pop",
        description = "Balanced sound with slight bass boost and clear vocals. Perfect for contemporary pop music.",
        category = "Genre",
        tags = {"pop", "vocal", "modern", "commercial", "mainstream"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = -0.5, q = 1.0 },
            { frequency = 62,    gain = 2.5,  q = 1.2 },
            { frequency = 125,   gain = 4.0,  q = 1.5 },
            { frequency = 250,   gain = 3.5,  q = 1.8 },
            { frequency = 500,   gain = 1.5,  q = 1.5 },
            { frequency = 1000,  gain = -0.5, q = 1.0 },
            { frequency = 2000,  gain = -1.0, q = 1.2 },
            { frequency = 4000,  gain = 0.0,  q = 1.5 },
            { frequency = 8000,  gain = 1.5,  q = 1.8 },
            { frequency = 16000, gain = 2.0,  q = 2.0 },
            { frequency = 40,    gain = 1.0,  q = 1.0 },
            { frequency = 80,    gain = 3.5,  q = 1.3 },
            { frequency = 160,   gain = 3.0,  q = 1.5 },
            { frequency = 400,   gain = 0.0,  q = 1.0 },
            { frequency = 3000,  gain = -0.5, q = 1.5 },
            { frequency = 6000,  gain = 1.0,  q = 1.8 }
        }
    },
    {
        name = "Electronic",
        description = "Enhanced bass and treble for electronic music with punchy dynamics. Suitable for EDM, house, and techno.",
        category = "Genre",
        tags = {"electronic", "edm", "dance", "techno", "house", "synth"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = 7.0,  q = 1.2 },
            { frequency = 62,    gain = 5.5,  q = 1.0 },
            { frequency = 125,   gain = 2.0,  q = 1.5 },
            { frequency = 250,   gain = 0.0,  q = 1.8 },
            { frequency = 500,   gain = -2.5, q = 1.5 },
            { frequency = 1000,  gain = 1.0,  q = 1.2 },
            { frequency = 2000,  gain = 1.5,  q = 1.0 },
            { frequency = 4000,  gain = 3.0,  q = 1.5 },
            { frequency = 8000,  gain = 6.5,  q = 2.0 },
            { frequency = 16000, gain = 8.0,  q = 2.5 },
            { frequency = 40,    gain = 6.5,  q = 1.2 },
            { frequency = 90,    gain = 3.5,  q = 1.3 },
            { frequency = 180,   gain = 0.5,  q = 1.5 },
            { frequency = 700,   gain = -1.5, q = 1.2 },
            { frequency = 3000,  gain = 2.0,  q = 1.5 },
            { frequency = 12000, gain = 7.0,  q = 2.2 }
        }
    },
    {
        name = "Hip Hop",
        description = "Strong bass emphasis with clear vocals and controlled highs. Designed for hip hop and rap.",
        category = "Genre",
        tags = {"hip hop", "rap", "bass", "urban", "trap", "vocal"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = 8.0,  q = 1.2 },
            { frequency = 62,    gain = 6.5,  q = 1.0 },
            { frequency = 125,   gain = 3.0,  q = 1.5 },
            { frequency = 250,   gain = 2.0,  q = 1.8 },
            { frequency = 500,   gain = -0.5, q = 1.5 },
            { frequency = 1000,  gain = -1.5, q = 1.2 },
            { frequency = 2000,  gain = 0.5,  q = 1.0 },
            { frequency = 4000,  gain = 2.5,  q = 1.5 },
            { frequency = 8000,  gain = 3.0,  q = 2.0 },
            { frequency = 16000, gain = 3.5,  q = 2.5 },
            { frequency = 40,    gain = 7.5,  q = 1.1 },
            { frequency = 80,    gain = 5.0,  q = 1.0 },
            { frequency = 160,   gain = 2.5,  q = 1.3 },
            { frequency = 320,   gain = 1.0,  q = 1.5 },
            { frequency = 3000,  gain = 1.5,  q = 1.3 },
            { frequency = 10000, gain = 2.5,  q = 2.0 }
        }
    },

    --=============================================
    -- GENRE PRESETS - JAZZ & ACOUSTIC
    --=============================================
    {
        name = "Jazz",
        description = "Warm, smooth sound with enhanced midrange and controlled highs. Perfect for jazz recordings.",
        category = "Genre",
        tags = {"jazz", "acoustic", "warm", "instrumental", "smooth"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = 3.0,  q = 1.0 },
            { frequency = 62,    gain = 2.5,  q = 1.2 },
            { frequency = 125,   gain = 1.5,  q = 1.5 },
            { frequency = 250,   gain = 2.0,  q = 1.8 },
            { frequency = 500,   gain = -0.5, q = 1.5 },
            { frequency = 1000,  gain = -1.5, q = 1.2 },
            { frequency = 2000,  gain = 0.0,  q = 1.0 },
            { frequency = 4000,  gain = 0.5,  q = 1.5 },
            { frequency = 8000,  gain = 1.5,  q = 2.0 },
            { frequency = 16000, gain = 2.0,  q = 2.5 },
            { frequency = 45,    gain = 2.5,  q = 1.1 },
            { frequency = 80,    gain = 2.0,  q = 1.3 },
            { frequency = 160,   gain = 1.5,  q = 1.6 },
            { frequency = 1500,  gain = -0.5, q = 1.2 },
            { frequency = 3000,  gain = 0.0,  q = 1.3 },
            { frequency = 12000, gain = 1.0,  q = 2.2 }
        }
    },
    {
        name = "Classical",
        description = "Natural, transparent sound with subtle enhancement for orchestral music.",
        category = "Genre",
        tags = {"classical", "orchestra", "instrumental", "acoustic", "natural"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = 3.5,  q = 1.0 },
            { frequency = 62,    gain = 3.0,  q = 1.2 },
            { frequency = 125,   gain = 2.0,  q = 1.5 },
            { frequency = 250,   gain = 1.0,  q = 1.8 },
            { frequency = 500,   gain = -0.5, q = 1.5 },
            { frequency = 1000,  gain = -1.5, q = 1.2 },
            { frequency = 2000,  gain = -1.0, q = 1.0 },
            { frequency = 4000,  gain = 0.0,  q = 1.5 },
            { frequency = 8000,  gain = 2.0,  q = 2.0 },
            { frequency = 16000, gain = 2.5,  q = 2.5 },
            { frequency = 40,    gain = 3.0,  q = 1.0 },
            { frequency = 80,    gain = 2.5,  q = 1.3 },
            { frequency = 160,   gain = 1.5,  q = 1.6 },
            { frequency = 1500,  gain = -1.0, q = 1.2 },
            { frequency = 3000,  gain = -0.5, q = 1.3 },
            { frequency = 12000, gain = 1.5,  q = 2.2 }
        }
    },
    {
        name = "Acoustic",
        description = "Natural tonal balance for acoustic instruments with enhanced presence.",
        category = "Genre",
        tags = {"acoustic", "guitar", "folk", "natural", "vocal", "unplugged"},
        version = "1.0",
        bands = {
            { frequency = 31,    gain = 2.0,  q = 1.0 },
            { frequency = 62,    gain = 1.5,  q = 1.0 },
            { frequency = 125,   gain = 1.0,  q = 1.2 },
            { frequency = 250,   gain = 2.0,  q = 1.5 },
            { frequency = 500,   gain = 1.0,  q = 1.5 },
            { frequency = 1000,  gain = 0.0,  q = 1.0 },
            { frequency = 2000,  gain = 2.5,  q = 1.2 },
            { frequency = 4000,  gain = 3.0,  q = 1.5 },
            { frequency = 8000,  gain = 2.0,  q = 1.8 },
            { frequency = 16000, gain = 1.5,  q = 2.0 },
            { frequency = 100,   gain = 1.0,  q = 1.2 }, -- Body warmth
            { frequency = 200,   gain = 2.5,  q = 1.4 }, -- Acoustic instrument resonance
            { frequency = 800,   gain = 0.5,  q = 1.5 },
            { frequency = 1500,  gain = 1.0,  q = 1.3 },
            { frequency = 3000,  gain = 3.5,  q = 1.4 }, -- String detail
            { frequency = 6000,  gain = 2.5,  q = 1.6 }  -- Presence
        }
    },
    {
        name = "Blues",
        description = "Warm with emphasis on guitar and vocal presence for blues recordings.",
        category = "Genre",
        tags = {"blues", "guitar", "vocal", "warm", "traditional"},
        version = "1.0",
        bands = {
            { frequency = 31,    gain = 2.0,  q = 1.0 },
            { frequency = 62,    gain = 1.5,  q = 1.0 },
            { frequency = 125,   gain = 1.0,  q = 1.2 },
            { frequency = 250,   gain = 2.5,  q = 1.5 },
            { frequency = 500,   gain = 0.0,  q = 1.5 },
            { frequency = 1000,  gain = 1.0,  q = 1.0 },
            { frequency = 2000,  gain = 3.0,  q = 1.2 },
            { frequency = 4000,  gain = 2.0,  q = 1.5 },
            { frequency = 8000,  gain = 1.0,  q = 1.8 },
            { frequency = 16000, gain = 0.5,  q = 2.0 },
            { frequency = 80,    gain = 1.5,  q = 1.1 },
            { frequency = 180,   gain = 2.0,  q = 1.3 }, -- Guitar body
            { frequency = 800,   gain = 0.5,  q = 1.4 },
            { frequency = 1500,  gain = 2.0,  q = 1.2 }, -- Vocal presence
            { frequency = 3000,  gain = 2.5,  q = 1.3 }, -- Guitar detail
            { frequency = 5000,  gain = 1.5,  q = 1.5 }
        }
    },

    --=============================================
    -- ENHANCEMENT PRESETS
    --=============================================
    {
        name = "Treble Boost",
        description = "Adds brightness and air to the sound for enhanced detail.",
        category = "Enhancement",
        tags = {"treble", "brightness", "air", "detail", "high end", "enhancement"},
        version = "2.0",
        bands = {
            { frequency = 31,    gain = 0.0, q = 1.0 },
            { frequency = 62,    gain = 0.0, q = 1.0 },
            { frequency = 125,   gain = 0.0, q = 1.0 },
            { frequency = 250,   gain = 0.0, q = 1.0 },
            { frequency = 500,   gain = 0.0, q = 1.0 },
            { frequency = 1000,  gain = 1.0, q = 1.5 },
            { frequency = 2000,  gain = 2.5, q = 2.0 },
            { frequency = 4000,  gain = 4.5, q = 2.5 },
            { frequency = 8000,  gain = 6.0, q = 3.0 },
            { frequency = 16000, gain = 7.0, q = 3.0 },
            { frequency = 1500,  gain = 2.0, q = 1.8 },
            { frequency = 3000,  gain = 3.5, q = 2.3 },
            { frequency = 6000,  gain = 5.0, q = 2.8 }, -- Presence
            { frequency = 10000, gain = 6.5, q = 3.0 }, -- Brightness
            { frequency = 12000, gain = 7.0, q = 3.0 }, -- Air
            { frequency = 14000, gain = 7.5, q = 3.0 }  -- Extreme air
        }
    },
    {
        name = "Clarity",
        description = "Enhances the intelligibility of music and vocals without excessive brightness.",
        category = "Enhancement",
        tags = {"clarity", "definition", "detail", "balanced", "intelligible"},
        version = "1.0",
        bands = {
            { frequency = 31,    gain = -1.0, q = 1.0 },
            { frequency = 62,    gain = -0.5, q = 1.0 },
            { frequency = 125,   gain = 0.0,  q = 1.0 },
            { frequency = 250,   gain = -1.0, q = 1.2 }, -- Reduce mud
            { frequency = 500,   gain = -2.0, q = 1.5 }, -- Reduce mud
            { frequency = 1000,  gain = 0.0,  q = 1.0 },
            { frequency = 2000,  gain = 3.0,  q = 1.5 }, -- Add presence
            { frequency = 4000,  gain = 4.0,  q = 1.8 }, -- Add detail
            { frequency = 8000,  gain = 3.0,  q = 2.0 }, -- Add air
            { frequency = 16000, gain = 2.0,  q = 2.0 }, -- Add sparkle
            { frequency = 400,   gain = -1.5, q = 1.4 },
            { frequency = 800,   gain = -1.0, q = 1.2 },
            { frequency = 1500,  gain = 1.5,  q = 1.5 },
            { frequency = 3000,  gain = 3.5,  q = 1.7 }, -- Articulation
            { frequency = 5000,  gain = 4.0,  q = 1.9 }, -- Presence
            { frequency = 10000, gain = 2.5,  q = 2.0 }  -- Air
        }
    },
}
