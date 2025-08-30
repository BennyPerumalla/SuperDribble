/*****************************************************************************
 * equalizer.cpp: Integrated parametric equalizer with adaptive presets
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
#include <cmath>
#include <algorithm>
#include <cstring>
#include <cstdint>
#include <vector>


// Constants
const double PI = 3.14159265358979323846;
const int MAX_BANDS = 16;
const int TRANSITION_SAMPLES = 1024;
const float MIN_GAIN = -24.0f;
const float MAX_GAIN = 24.0f;
const int ANALYSIS_SIZE = 512;
/***************************************
 * Core BiquadFilter 
 ***************************************/
class BiquadFilter {
public:
    double b0, b1, b2;  // feedforward
    double a1, a2;      // feedback (a0 is assumed 1)
    double z1, z2;      // state
    BiquadFilter() : b0(1.0), b1(0.0), b2(0.0), a1(0.0), a2(0.0), z1(0.0), z2(0.0) {}
    double processSample(double in) {
        double out = in * b0 + z1;
        z1 = in * b1 - a1 * out + z2;
        z2 = in * b2 - a2 * out;
        return out;
    }
};

/***************************************
 * Equivalent BandParams structure
 ***************************************/
struct BandParams {
    float freq, gain, q;
    BandParams() : freq(1000.0f), gain(0.0f), q(1.0f) {}
};

/***************************************
 * Audio Analysis for adaptive preset selection
 ***************************************/
struct AudioAnalysis {
    float rmsLevel;
    float peakLevel;
    float spectralCentroid;
    float bassEnergy;
    float midEnergy;
    float trebleEnergy;
    AudioAnalysis() : rmsLevel(0.0f), peakLevel(0.0f), spectralCentroid(0.0f),
        bassEnergy(0.0f), midEnergy(0.0f), trebleEnergy(0.0f) {}
};
/***************************************
 * CompactPreset storage
 ***************************************/
struct CompactPreset {
    char name[32];
    uint8_t category;
    BandParams bands[MAX_BANDS];
    float suitabilityWeights[6];
};

/***************************************
 * Custom Clamp Macro or Inline Function
 ***************************************/

#ifndef HAS_STD_CLAMP
template<typename T>
T clamp(const T& v, const T& lo, const T& hi) {
    return (v < lo) ? lo : (hi < v) ? hi : v;
}
#else
using std::clamp;
#endif


/***************************************
 * Integrated Equalizer class
 ***************************************/
class Equalizer {
private:
    double sampleRate;
    BiquadFilter bands[MAX_BANDS];
    BandParams bandParams[MAX_BANDS];
    BandParams targetBands[MAX_BANDS];
    BandParams startBands[MAX_BANDS];
    bool isTransitioning;
    int transitionProgress;
    int transitionDuration;
    AudioAnalysis currentAnalysis;
    float analysisBuffer[ANALYSIS_SIZE];
    int analysisIndex;
    std::vector<CompactPreset> presets;
    int activePresetIndex;
    int coeffUpdateCounter = 0;
    bool needsUpdate[MAX_BANDS];
    inline void setFilterBypass(int bandIndex) {
        bands[bandIndex].b0 = 1.0;
        bands[bandIndex].b1 = 0.0;
        bands[bandIndex].b2 = 0.0;
        bands[bandIndex].a1 = 0.0;
        bands[bandIndex].a2 = 0.0;
        bands[bandIndex].z1 = bands[bandIndex].z2 = 0.0;
    }
    inline void calculateCoefficients(int bandIndex) {
        float freq = bandParams[bandIndex].freq;
        float gainDb = bandParams[bandIndex].gain;
        float q = bandParams[bandIndex].q;
        // Clamp values
        freq = clamp(freq, 20.0f, 20000.0f);
        gainDb = clamp(gainDb, MIN_GAIN, MAX_GAIN);
        q = clamp(q, 0.1f, 30.0f);
        double w0 = 2.0 * PI * freq / sampleRate;
        if (!std::isfinite(w0) || sampleRate <= 0.0) { setFilterBypass(bandIndex); return; }
        double A = pow(10.0, gainDb / 40.0);
        double cos_w0 = cos(w0);
        double sin_w0 = sin(w0);
        double alpha = sin_w0 / (2.0 * q);
        if (!std::isfinite(alpha) || !std::isfinite(A)) { setFilterBypass(bandIndex); return; }
        double b0 = 1.0 + alpha * A;
        double b1 = -2.0 * cos_w0;
        double b2 = 1.0 - alpha * A;
        double a0 = 1.0 + alpha / A;
        double a1 = -2.0 * cos_w0;
        double a2 = 1.0 - alpha / A;
        
        bands[bandIndex].b0 = b0 / a0;
        bands[bandIndex].b1 = b1 / a0;
        bands[bandIndex].b2 = b2 / a0;
        bands[bandIndex].a1 = a1 / a0;
        bands[bandIndex].a2 = a2 / a0;
    }
    void updateAnalysis(float sample) {
        analysisBuffer[analysisIndex] = sample;
        analysisIndex = (analysisIndex + 1) % ANALYSIS_SIZE;
        if (analysisIndex == 0) {
            float rms = 0.0f, peak = 0.0f;
            float bassSum = 0.0f, midSum = 0.0f, trebleSum = 0.0f;

            // Derive band lengths from ANALYSIS_SIZE
            const int BASS_COUNT   = ANALYSIS_SIZE / 8;        // 1/8 of window (64 when ANALYSIS_SIZE = 512)
            const int MID_COUNT    = (ANALYSIS_SIZE * 3) / 8;  // 3/8 of window (192 when 512)
            const int TREBLE_COUNT = ANALYSIS_SIZE - BASS_COUNT - MID_COUNT; // remainder (256 when 512)

            const int BASS_END = BASS_COUNT;                  // index < BASS_END
            const int MID_END  = BASS_COUNT + MID_COUNT;      // index < MID_END => mid, else treble

            for (int i = 0; i < ANALYSIS_SIZE; i++) {
                float s = analysisBuffer[i];
                float absS = fabsf(s);
                rms += s * s;
                peak = std::max(peak, absS);

                if (i < BASS_END) {
                    bassSum += absS;
                } else if (i < MID_END) {
                    midSum += absS;
                } else {
                    trebleSum += absS;
                    }
                }

                // Normalize using the actual bucket sizes
                currentAnalysis.rmsLevel = sqrtf(rms / float(ANALYSIS_SIZE));
                currentAnalysis.peakLevel = peak;
                currentAnalysis.bassEnergy = (BASS_COUNT   > 0) ? (bassSum   / float(BASS_COUNT))   : 0.0f;
                currentAnalysis.midEnergy  = (MID_COUNT    > 0) ? (midSum    / float(MID_COUNT))    : 0.0f;
                currentAnalysis.trebleEnergy = (TREBLE_COUNT > 0) ? (trebleSum / float(TREBLE_COUNT)) : 0.0f;

                // Your centroid heuristic can stay the same
                currentAnalysis.spectralCentroid =
                    (currentAnalysis.midEnergy * 1000.0f + currentAnalysis.trebleEnergy * 4000.0f) /
                    (currentAnalysis.bassEnergy + currentAnalysis.midEnergy + currentAnalysis.trebleEnergy + 1e-10f);
        }
    }
    float calculatePresetSuitability(int presetIndex) const {
        if (presetIndex < 0 || presetIndex >= (int)presets.size()) return 0.0f;        
        const CompactPreset& preset = presets[presetIndex];
        float score = 0.0f;
        score += preset.suitabilityWeights[0] * currentAnalysis.rmsLevel;
        score += preset.suitabilityWeights[1] * currentAnalysis.peakLevel;
        score += preset.suitabilityWeights[2] * (currentAnalysis.spectralCentroid / 4000.0f);
        score += preset.suitabilityWeights[3] * currentAnalysis.bassEnergy;
        score += preset.suitabilityWeights[4] * currentAnalysis.midEnergy;
        score += preset.suitabilityWeights[5] * currentAnalysis.trebleEnergy;
        return clamp(score, 0.0f, 1.0f);
    }
    void updateTransition() {
        if (!isTransitioning) return;
        float progress = (float)transitionProgress / (float)transitionDuration;
        if (progress > 1.0f) progress = 1.0f;
        float smoothed = 0.5f * (1.0f - cos(PI * progress)); // easing function
        coeffUpdateCounter++;
        bool doCoeff = (coeffUpdateCounter >= 8);
        if (doCoeff) coeffUpdateCounter = 0;
        for (int i = 0; i < MAX_BANDS; ++i) {
            if (!needsUpdate[i]) continue;
            bandParams[i].freq = startBands[i].freq + smoothed * (targetBands[i].freq - startBands[i].freq);
            bandParams[i].gain = startBands[i].gain + smoothed * (targetBands[i].gain - startBands[i].gain);
            bandParams[i].q    = startBands[i].q    + smoothed * (targetBands[i].q    - startBands[i].q);
            if (doCoeff) calculateCoefficients(i);
        }
        transitionProgress++;
        if (transitionProgress >= transitionDuration) {
            // Snap to exact target and finish
            for (int i = 0; i < MAX_BANDS; ++i) {
                if (needsUpdate[i]) {
                    bandParams[i] = targetBands[i];
                    calculateCoefficients(i);
                }
            }
            isTransitioning = false;
            std::fill(needsUpdate, needsUpdate + MAX_BANDS, false);
        }
    }

public:
    Equalizer(double rate) : sampleRate(rate), isTransitioning(false),
    transitionProgress(0), transitionDuration(TRANSITION_SAMPLES),
    analysisIndex(0), activePresetIndex(-1) {
        if (rate <= 0.0) rate = 44100.0;
        sampleRate = rate;
        for (int i = 0; i < MAX_BANDS; i++) {
            bands[i] = BiquadFilter();
            bandParams[i] = BandParams();
            needsUpdate[i] = false;
        }
        std::fill(analysisBuffer, analysisBuffer + ANALYSIS_SIZE, 0.0f);
    }
    void setBand(int bandIndex, float frequency, float gainDb, float q) {
        if (bandIndex < 0 || bandIndex >= MAX_BANDS) return;
        frequency = clamp(frequency, 20.0f, 20000.0f);
        gainDb = clamp(gainDb, MIN_GAIN, MAX_GAIN);
        q = clamp(q, 0.1f, 30.0f);
        {
            bandParams[bandIndex].freq = frequency;
            bandParams[bandIndex].gain = gainDb;
            bandParams[bandIndex].q = q;
            // compute coefficients immediately into the shared 'bands' (safe under lock)
            calculateCoefficients(bandIndex);
            activePresetIndex = -1;
        }
    }
    void loadPresets(const CompactPreset* presetData, int count) {
        if (count <= 0) { presets.clear(); return; }
        if (!presetData) return; // ignore invalid input
        presets.assign(presetData, presetData + count);
    }
    void applyPreset(int presetIndex, bool enableTransition = true) {
        if (presetIndex < 0 || presetIndex >= (int)presets.size()) return;
        const CompactPreset& preset = presets[presetIndex];
        if (enableTransition && activePresetIndex != -1) {
            for (int i = 0; i < MAX_BANDS; ++i) {
                startBands[i] = bandParams[i];    // capture start state ONCE
                targetBands[i] = preset.bands[i];
                needsUpdate[i] = true;
            }
            isTransitioning = true;
            transitionProgress = 0;
        } else {
            for (int i = 0; i < MAX_BANDS; ++i) {
                bandParams[i] = preset.bands[i];
                calculateCoefficients(i);
                needsUpdate[i] = false;
            }
            isTransitioning = false;
        }
        activePresetIndex = presetIndex;
    }
    int selectAdaptivePreset() {
        if (presets.empty()) return -1;
        float bestScore = -1.0f;
        int bestPreset = -1;
        for (int i = 0; i < (int)presets.size(); i++) {
            float score = calculatePresetSuitability(i);
            if (score > bestScore) {
                bestScore = score;
                bestPreset = i;
            }
        }
        return bestPreset;
    }
    void applyRelativeGain(float factor) {
        for (int i = 0; i < MAX_BANDS; i++) {
            float newGain = bandParams[i].gain * factor;
            newGain = clamp(newGain, MIN_GAIN, MAX_GAIN);
            bandParams[i].gain = newGain;
            calculateCoefficients(i);
        }
        activePresetIndex = -1;
    }
    void process(float* buffer, int numSamples) {
        for (int i = 0; i < numSamples; i++) {
            float sample = buffer[i];
            updateAnalysis(sample);
            if (isTransitioning) {
                updateTransition();
            }
            for (int j = 0; j < MAX_BANDS; j++) {
                // Apply core biquad filtering (double precision)
                sample = (float)bands[j].processSample(sample);
            }
            // Simple hard/soft clipping for safety
            if (sample > 1.0f) sample = 0.7f + 0.3f * tanhf(sample - 1.0f);
            else if (sample < -1.0f) sample = -0.7f + 0.3f * tanhf(sample + 1.0f);
            buffer[i] = sample;
        }
    }
    const AudioAnalysis& getAudioAnalysis() const {
        return currentAnalysis;
    }
    int getActivePreset() const {
        return activePresetIndex;
    }
};
// C Interface for WASM or external usage
extern "C" {
    Equalizer* create_equalizer(double sampleRate) {
        return new Equalizer(sampleRate);
    }
    void destroy_equalizer(Equalizer* eq) {
        delete eq;
    }
    void equalizer_set_band(Equalizer* eq, int bandIndex, float frequency, float gainDb, float q) {
        eq->setBand(bandIndex, frequency, gainDb, q);
    }
    void equalizer_process_buffer(Equalizer* eq, float* buffer, int numSamples) {
        eq->process(buffer, numSamples);
    }
    void equalizer_apply_preset(Equalizer* eq, int presetIndex, int enableTransition) {
        eq->applyPreset(presetIndex, enableTransition != 0);
    }
    int equalizer_select_adaptive_preset(Equalizer* eq) {
        return eq->selectAdaptivePreset();
    }
    void equalizer_apply_relative_gain(Equalizer* eq, float factor) {
        eq->applyRelativeGain(factor);
    }
    void equalizer_load_presets(Equalizer* eq, const CompactPreset* presets, int count) {
        eq->loadPresets(presets, count);
    }
    const AudioAnalysis* equalizer_get_analysis(Equalizer* eq) {
        return &eq->getAudioAnalysis();
    }
    int equalizer_get_active_preset(Equalizer* eq) {
        return eq->getActivePreset();
    }
}
