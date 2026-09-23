/*
 * Playback pacing, in milliseconds.
 *
 * The pad used to light for 150ms with a 500ms gap, so the board was dark
 * five-sixths of the time and the tone — which runs about half a second —
 * outlasted its own light by a wide margin. Audio and light were telling the
 * player two different things.
 *
 * Now the light is on for most of each step and the gap is only long enough
 * to separate two presses of the same pad. Similar overall tempo, far more
 * legible.
 *
 * These live in their own module because both Container (which schedules the
 * sequence) and Button (which owns the flash) need PAD_LIT_MS, and importing
 * it from one into the other would make the two circular.
 */

/** How long a pad stays lit, and how long its tone sounds. */
export const PAD_LIT_MS = 320;

/** How long a pad stays pushed in after the player presses it. */
export const PAD_PRESS_MS = 160;

/** Dark time between two pads during playback. */
export const PLAYBACK_GAP_MS = 170;

/** Beat before playback begins, so the player can settle. */
export const PLAYBACK_LEAD_MS = 650;

/**
 * Haptic pattern for a loss, as navigator.vibrate() takes it: buzz, pause,
 * buzz. Two short pulses read as "no"; one long one just reads as a buzz.
 */
export const FAIL_VIBRATION = [90, 70, 140];

/** How long the fail cue holds the final score before the board resets. */
export const FAIL_HOLD_MS = 1100;
