/* test_track_mixer.c */
#include <stdio.h>
#include <stdlib.h>
#include "track_mixer.c"

#define NUM_SAMPLES 10

int main() {
    printf("Testing Track Mixer Module\n");

    float track1[NUM_SAMPLES] = {0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0};
    float track2[NUM_SAMPLES] = {1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1};
    float output[NUM_SAMPLES];

    mix_tracks(track1, track2, output, NUM_SAMPLES);

    printf("Track 1 Samples:\n");
    for (int i = 0; i < NUM_SAMPLES; i++) {
        printf("%f ", track1[i]);
    }
    printf("\n\nTrack 2 Samples:\n");
    for (int i = 0; i < NUM_SAMPLES; i++) {
        printf("%f ", track2[i]);
    }
    printf("\n\nMixed Output Samples:\n");
    for (int i = 0; i < NUM_SAMPLES; i++) {
        printf("%f ", output[i]);
    }
    printf("\n");

    return 0;
}
