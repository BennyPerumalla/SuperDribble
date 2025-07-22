/*****************************************************************************
 * spatializer.cpp: Core DSP for stereo spatialization effects
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

#include <vector>
#include <cmath>
#include <algorithm>

const double PI = 3.14159265358979323846;
const int FDN_ORDER = 4; // 4x4 FDN for a good balance of quality and performance

/**
 * @struct DelayLine
 * @brief A simple circular buffer delay line.
 */
struct DelayLine {
    std::vector<float> buffer;
    int write_pos = 0;
    int buffer_size;

    DelayLine(int size = 0) : buffer_size(size) {
        if (size > 0) {
            buffer.resize(size, 0.0f);
        }
    }

    void set_size(int size) {
        buffer.assign(size, 0.0f);
        buffer_size = size;
        write_pos = 0;
    }

    void write(float sample) {
        buffer[write_pos] = sample;
        write_pos = (write_pos + 1) % buffer_size;
    }

    float read(int delay_samples) const {
        int read_pos = (write_pos - delay_samples + buffer_size) % buffer_size;
        return buffer[read_pos];
    }
};

/**
 * @class Spatializer
 * @brief Implements stereo widening and FDN reverberation.
 * The processing chain is as follows:
 * 1. Input (L/R) -> Mid/Side Conversion
 * 2. Side Channel Gain Adjustment (Width)
 * 3. Mid/Side -> L/R Conversion
 * 4. Wet Signal -> FDN Reverb
 * 5. Dry/Wet Mix
 */
class Spatializer {
private:
    double sampleRate;

    // --- Effect Parameters ---
    float width = 1.0f;    // Stereo width (1.0 = normal, >1 = wider)
    float decay = 0.5f;    // Reverb decay time (0-1)
    float damping = 0.5f;  // HF damping in reverb (0-1)
    float mix = 0.25f;     // Dry/Wet mix (0-1)

    // --- FDN Reverb Components ---
    DelayLine delay_lines[FDN_ORDER];
    float fdn_gains[FDN_ORDER]; // Feedback gains derived from decay
    float fdn_lp_z[FDN_ORDER] = {0}; // State for one-pole LPFs (damping)
    int delay_lengths[FDN_ORDER];

    // A simple 4x4 Hadamard matrix for feedback mixing. Computationally cheap.
    const float hadamard_matrix[FDN_ORDER][FDN_ORDER] = {
        { 1,  1,  1,  1 },
        { 1, -1,  1, -1 },
        { 1,  1, -1, -1 },
        { 1, -1, -1,  1 }
    };
    const float hadamard_norm = 0.5f; // 1/sqrt(N) for N=4

public:
    Spatializer(double rate) : sampleRate(rate) {
        // Mutually prime delay lengths for a diffuse reverb tail.
        // Scaled to a max of ~100ms.
        const int base_primes[] = { 1553, 1871, 2083, 2221 };
        for (int i = 0; i < FDN_ORDER; ++i) {
            delay_lengths[i] = static_cast<int>((base_primes[i] / 2221.0) * sampleRate * 0.1);
            delay_lines[i].set_size(delay_lengths[i] + 2); // A little extra room
        }
        update_params();
    }

    void update_params() {
        // Map decay (0-1) to feedback gain. Exponential mapping feels more natural.
        for (int i = 0; i < FDN_ORDER; ++i) {
            fdn_gains[i] = pow(0.001, static_cast<double>(delay_lengths[i]) / (decay * sampleRate));
            if (decay == 0.0) fdn_gains[i] = 0.0;
        }
    }

    // --- Setters for real-time control ---
    void set_width(float w) { width = std::max(0.0f, w); }
    void set_decay(float d) { decay = std::max(0.0f, std::min(1.0f, d)); update_params(); }
    void set_damping(float d) { damping = std::max(0.0f, std::min(1.0f, d)); }
    void set_mix(float m) { mix = std::max(0.0f, std::min(1.0f, m)); }

    /**
     * @brief Processes a stereo audio buffer in-place.
     * @param buffer Interleaved stereo float buffer (L, R, L, R, ...).
     * @param num_frames The number of stereo frames (num_samples / 2).
     */
    void process(float* buffer, int num_frames) {
        for (int i = 0; i < num_frames; ++i) {
            float dry_l = buffer[i * 2];
            float dry_r = buffer[i * 2 + 1];

            // --- 1. Stereo Widener (Mid/Side) ---
            float mid = (dry_l + dry_r) * 0.5f;
            float side = (dry_l - dry_r) * 0.5f;
            side *= width; // Apply width control
            float wide_l = mid + side;
            float wide_r = mid - side;

            // --- 2. FDN Reverb (input is mono sum of widened signal) ---
            float fdn_input = (wide_l + wide_r) * 0.5f;
            float fdn_outputs[FDN_ORDER];
            float fdn_mixed_inputs[FDN_ORDER] = {0};

            // Read from delay lines and mix feedback
            for(int j = 0; j < FDN_ORDER; ++j) {
                fdn_outputs[j] = delay_lines[j].read(delay_lengths[j]);
            }

            for(int j = 0; j < FDN_ORDER; ++j) {
                for(int k = 0; k < FDN_ORDER; ++k) {
                    fdn_mixed_inputs[j] += fdn_outputs[k] * hadamard_matrix[j][k];
                }
                fdn_mixed_inputs[j] *= hadamard_norm;
            }

            // Write to delay lines with input, feedback, and damping
            float wet_l = 0.0f, wet_r = 0.0f;
            for(int j = 0; j < FDN_ORDER; ++j) {
                // Apply damping (one-pole LPF)
                float feedback = fdn_mixed_inputs[j] * fdn_gains[j];
                feedback = (1.0f - damping) * feedback + damping * fdn_lp_z[j];
                fdn_lp_z[j] = feedback;

                delay_lines[j].write(fdn_input + feedback);

                // Create stereo output by alternating taps
                if (j % 2 == 0) wet_l += fdn_outputs[j];
                else wet_r += fdn_outputs[j];
            }
            // Normalize reverb output
            wet_l *= 0.5f;
            wet_r *= 0.5f;

            // --- 3. Final Dry/Wet Mix ---
            buffer[i * 2] = (wide_l * (1.0f - mix)) + (wet_l * mix);
            buffer[i * 2 + 1] = (wide_r * (1.0f - mix)) + (wet_r * mix);
        }
    }
};

// --- C-style WASM exports ---
extern "C" {
    Spatializer* create_spatializer(double sampleRate) {
        return new Spatializer(sampleRate);
    }

    void destroy_spatializer(Spatializer* sp) {
        delete sp;
    }

    void spatializer_set_width(Spatializer* sp, float width) { sp->set_width(width); }
    void spatializer_set_decay(Spatializer* sp, float decay) { sp->set_decay(decay); }
    void spatializer_set_damping(Spatializer* sp, float damping) { sp->set_damping(damping); }
    void spatializer_set_mix(Spatializer* sp, float mix) { sp->set_mix(mix); }

    void spatializer_process_buffer(Spatializer* sp, float* buffer, int num_frames) {
        sp->process(buffer, num_frames);
    }
}
