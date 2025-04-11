/* track_mixer.c */
#include <stdio.h>
#include <stdlib.h>

// Function prototypes
void mix_tracks(float *track1, float *track2, float *output, int num_samples);
void apply_fade_in(float *track, int num_samples);
void apply_fade_out(float *track, int num_samples);

// Main function for testing
int main() {
    printf("Track Mixer Module\n");
    return 0;
}

// Implementation of track mixing
void mix_tracks(float *track1, float *track2, float *output, int num_samples) {
    for (int i = 0; i < num_samples; i++) {
        output[i] = (track1[i] + track2[i]) / 2; // Simple average mix
    }
}

// Implementation of fade-in effect
void apply_fade_in(float *track, int num_samples) {
    for (int i = 0; i < num_samples; i++) {
        track[i] *= (float)i / num_samples; // Linear fade-in
    }
}

// Implementation of fade-out effect
void apply_fade_out(float *track, int num_samples) {
    for (int i = 0; i < num_samples; i++) {
        track[i] *= (float)(num_samples - i) / num_samples; // Linear fade-out
    }
}
