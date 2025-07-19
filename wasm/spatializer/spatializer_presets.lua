/***************************************************************************
 * spatializer_presets.lua: Built-in spatializer presets for Super-Dribble
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
 *****************************************************************************/

-------------------------------------------------------------------------------
-- Spatializer Presets
-- Inspired by IAMF terminology for describing acoustic scenes.
-------------------------------------------------------------------------------
spatial_presets = {
  {
    name = "Studio Room",
    description = "A tight, controlled acoustic space. Adds presence without washing out the source.",
    params = {
      width = 1.1,   -- Subtle widening
      decay = 0.25,  -- Short decay time
      damping = 0.6, -- More damping for a less bright tail
      mix = 0.20     -- Lower dry/wet mix
    }
  },
  {
    name = "Concert Hall",
    description = "Simulates a large, reverberant hall. Ideal for classical or ambient music.",
    params = {
      width = 1.25,  -- Wider scene to match the large space
      decay = 0.8,   -- Long, lush decay
      damping = 0.3, -- Less damping to allow high frequencies to linger
      mix = 0.40     -- A significant amount of effect
    }
  },
  {
    name = "Expansive Cinema",
    description = "Creates a wide, immersive soundstage with moderate reverb. Good for movies and gaming.",
    params = {
      width = 1.8,   -- Very wide stereo image
      decay = 0.5,   -- Medium decay, not as long as a hall
      damping = 0.5, -- Balanced damping
      mix = 0.35     -- Noticeable but not overwhelming effect
    }
  }
}
