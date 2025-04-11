/* test_prologic_upmix.c */
#include <stdio.h>
#include <stdlib.h>
#include "prologic_upmix.c"

#define NUM_SAMPLES 10

int main() {
    printf("Testing Prologic-II Upmixing Module\n");

    float input[NUM_SAMPLES] = {0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0};
    float output[NUM_SAMPLES];

    prologic_upmix(input, output, NUM_SAMPLES);

    printf("Input Samples:\n");
    for (int i = 0; i < NUM_SAMPLES; i++) {
        printf("%f ", input[i]);
    }
    printf("\n\nOutput Samples:\n");
    for (int i = 0; i < NUM_SAMPLES; i++) {
        printf("%f ", output[i]);
    }
    printf("\n");

    return 0;
}
