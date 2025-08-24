 ***************************************************************************
 * presets.lua: Built-in equalizer presets for Super-Dribble
 *****************************************************************************
 * Copyright (C) 2024 Benny Perumalla
 *
 * Author: Benny Perumalla <benny01r@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
 *****************************************************************************


-- Each preset is a table containing:
--   - name: A string for the UI.
--   - bands: An array of 16 tables, each defining a single EQ band.
--
-- Each band table contains:
--   - frequency: The center frequency in Hz.
--   - gain: The boost or cut in decibels (dB).
--   - q: The Q factor, which controls the bandwidth of the filter.

presets = {
  {
    name = "Flat",
    description = "Neutral response with no frequency adjustments.",
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
  {
    name = "Rock",
    description = "Enhanced bass and treble for rock music with punchy mids.",
    bands = {
      { frequency = 31,    gain = 4.0,  q = 1.2 },
      { frequency = 62,    gain = 3.0,  q = 1.0 },
      { frequency = 125,   gain = -1.0, q = 1.0 },
      { frequency = 250,   gain = -2.0, q = 1.0 },
      { frequency = 500,   gain = -1.0, q = 1.0 },
      { frequency = 1000,  gain = 2.0,  q = 1.5 },
      { frequency = 2000,  gain = 4.0,  q = 1.8 },
      { frequency = 4000,  gain = 6.0,  q = 2.0 },
      { frequency = 8000,  gain = 6.0,  q = 2.5 },
      { frequency = 16000, gain = 5.0,  q = 2.0 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Pop",
    description = "Balanced sound with slight bass boost and clear vocals.",
    bands = {
      { frequency = 31,    gain = -1.0, q = 1.0 },
      { frequency = 62,    gain = 2.0,  q = 1.2 },
      { frequency = 125,   gain = 4.0,  q = 1.5 },
      { frequency = 250,   gain = 4.0,  q = 1.8 },
      { frequency = 500,   gain = 2.0,  q = 1.5 },
      { frequency = 1000,  gain = 0.0,  q = 1.0 },
      { frequency = 2000,  gain = -1.0, q = 1.2 },
      { frequency = 4000,  gain = -1.0, q = 1.5 },
      { frequency = 8000,  gain = 0.0,  q = 1.8 },
      { frequency = 16000, gain = 1.0,  q = 2.0 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Jazz",
    description = "Warm, smooth sound with enhanced midrange and controlled highs.",
    bands = {
      { frequency = 31,    gain = 3.0,  q = 1.0 },
      { frequency = 62,    gain = 2.0,  q = 1.2 },
      { frequency = 125,   gain = 1.0,  q = 1.5 },
      { frequency = 250,   gain = 2.0,  q = 1.8 },
      { frequency = 500,   gain = -1.0, q = 1.5 },
      { frequency = 1000,  gain = -1.0, q = 1.2 },
      { frequency = 2000,  gain = 0.0,  q = 1.0 },
      { frequency = 4000,  gain = 1.0,  q = 1.5 },
      { frequency = 8000,  gain = 2.0,  q = 2.0 },
      { frequency = 16000, gain = 3.0,  q = 2.5 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Classical",
    description = "Natural, transparent sound with subtle enhancement for orchestral music.",
    bands = {
      { frequency = 31,    gain = 4.0,  q = 1.0 },
      { frequency = 62,    gain = 3.0,  q = 1.2 },
      { frequency = 125,   gain = 2.0,  q = 1.5 },
      { frequency = 250,   gain = 1.0,  q = 1.8 },
      { frequency = 500,   gain = -1.0, q = 1.5 },
      { frequency = 1000,  gain = -2.0, q = 1.2 },
      { frequency = 2000,  gain = -2.0, q = 1.0 },
      { frequency = 4000,  gain = -1.0, q = 1.5 },
      { frequency = 8000,  gain = 2.0,  q = 2.0 },
      { frequency = 16000, gain = 3.0,  q = 2.5 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Electronic",
    description = "Enhanced bass and treble for electronic music with punchy dynamics.",
    bands = {
      { frequency = 31,    gain = 6.0,  q = 1.2 },
      { frequency = 62,    gain = 4.0,  q = 1.0 },
      { frequency = 125,   gain = 1.0,  q = 1.5 },
      { frequency = 250,   gain = 0.0,  q = 1.8 },
      { frequency = 500,   gain = -2.0, q = 1.5 },
      { frequency = 1000,  gain = 2.0,  q = 1.2 },
      { frequency = 2000,  gain = 1.0,  q = 1.0 },
      { frequency = 4000,  gain = 2.0,  q = 1.5 },
      { frequency = 8000,  gain = 6.0,  q = 2.0 },
      { frequency = 16000, gain = 7.0,  q = 2.5 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Hip Hop",
    description = "Strong bass emphasis with clear vocals and controlled highs.",
    bands = {
      { frequency = 31,    gain = 7.0,  q = 1.2 },
      { frequency = 62,    gain = 5.0,  q = 1.0 },
      { frequency = 125,   gain = 1.0,  q = 1.5 },
      { frequency = 250,   gain = 3.0,  q = 1.8 },
      { frequency = 500,   gain = -1.0, q = 1.5 },
      { frequency = 1000,  gain = -1.0, q = 1.2 },
      { frequency = 2000,  gain = 1.0,  q = 1.0 },
      { frequency = 4000,  gain = 2.0,  q = 1.5 },
      { frequency = 8000,  gain = 3.0,  q = 2.0 },
      { frequency = 16000, gain = 4.0,  q = 2.5 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Vocal Boost",
    description = "Adds clarity and presence to vocals.",
    bands = {
      { frequency = 31,    gain = -2.0, q = 1.0 },
      { frequency = 62,    gain = -1.0, q = 1.0 },
      { frequency = 125,   gain = 0.0,  q = 1.0 },
      { frequency = 250,   gain = 0.0,  q = 1.0 },
      { frequency = 500,   gain = 1.0,  q = 1.4 },
      { frequency = 1000,  gain = 2.5,  q = 1.8 },
      { frequency = 2000,  gain = 3.0,  q = 1.8 },
      { frequency = 4000,  gain = 2.0,  q = 2.0 },
      { frequency = 8000,  gain = 1.0,  q = 2.0 },
      { frequency = 16000, gain = 0.0,  q = 1.0 },
      { frequency = 32,    gain = 0.0,  q = 1.0 },
      { frequency = 64,    gain = 0.0,  q = 1.0 },
      { frequency = 128,   gain = 0.0,  q = 1.0 },
      { frequency = 256,   gain = 0.0,  q = 1.0 },
      { frequency = 512,   gain = 0.0,  q = 1.0 },
      { frequency = 1024,  gain = 0.0,  q = 1.0 }
    }
  },
  {
    name = "Bass Cut",
    description = "Reduces low-end frequencies, useful for podcasts or removing rumble.",
    bands = {
      { frequency = 31,    gain = -18.0, q = 0.71 },
      { frequency = 62,    gain = -12.0, q = 0.8 },
      { frequency = 125,   gain = -6.0,  q = 1.0 },
      { frequency = 250,   gain = -2.0,  q = 1.2 },
      { frequency = 500,   gain = 0.0,   q = 1.0 },
      { frequency = 1000,  gain = 0.0,   q = 1.0 },
      { frequency = 2000,  gain = 0.0,   q = 1.0 },
      { frequency = 4000,  gain = 0.0,   q = 1.0 },
      { frequency = 8000,  gain = 0.0,   q = 1.0 },
      { frequency = 16000, gain = 0.0,   q = 1.0 },
      { frequency = 32,    gain = 0.0,   q = 1.0 },
      { frequency = 64,    gain = 0.0,   q = 1.0 },
      { frequency = 128,   gain = 0.0,   q = 1.0 },
      { frequency = 256,   gain = 0.0,   q = 1.0 },
      { frequency = 512,   gain = 0.0,   q = 1.0 },
      { frequency = 1024,  gain = 0.0,   q = 1.0 }
    }
  },
  {
    name = "Treble Boost",
    description = "Adds brightness and air to the sound.",
    bands = {
      { frequency = 31,    gain = 0.0, q = 1.0 },
      { frequency = 62,    gain = 0.0, q = 1.0 },
      { frequency = 125,   gain = 0.0, q = 1.0 },
      { frequency = 250,   gain = 0.0, q = 1.0 },
      { frequency = 500,   gain = 0.0, q = 1.0 },
      { frequency = 1000,  gain = 1.0, q = 1.5 },
      { frequency = 2000,  gain = 2.0, q = 2.0 },
      { frequency = 4000,  gain = 4.0, q = 2.5 },
      { frequency = 8000,  gain = 5.0, q = 3.0 },
      { frequency = 16000, gain = 6.0, q = 3.0 },
      { frequency = 32,    gain = 0.0, q = 1.0 },
      { frequency = 64,    gain = 0.0, q = 1.0 },
      { frequency = 128,   gain = 0.0, q = 1.0 },
      { frequency = 256,   gain = 0.0, q = 1.0 },
      { frequency = 512,   gain = 0.0, q = 1.0 },
      { frequency = 1024,  gain = 0.0, q = 1.0 }
    }
  }
}
