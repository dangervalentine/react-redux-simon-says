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

/**
 * Playback speeds up as the sequence grows, at the same points the original
 * Simon did: after the 5th, 9th and 13th step. A constant tempo made long
 * runs drag, and the acceleration is most of what makes a good run feel
 * tense. Both the light and the gap scale, so the rhythm keeps its shape.
 */
const PACE_TIERS = [
  { from: 13, scale: 0.62 },
  { from: 9, scale: 0.74 },
  { from: 5, scale: 0.87 },
];

/** Light and gap durations for playing back a sequence of this length. */
export const paceFor = (length) => {
  const scale = PACE_TIERS.find((t) => length >= t.from)?.scale ?? 1;
  return {
    lit: Math.round(PAD_LIT_MS * scale),
    gap: Math.round(PLAYBACK_GAP_MS * scale),
  };
};

/**
 * On a miss, the pad that should have been pressed blinks this many times,
 * silently, under the fail cue — the original Simon's "this one" gesture.
 */
export const FAIL_BLINKS = 3;
export const FAIL_BLINK_ON_MS = 170;
export const FAIL_BLINK_OFF_MS = 110;

/** How long the board pulses when a round is completed. */
export const ROUND_PULSE_MS = 420;

/** How long the fail cue holds the final score before the board resets. */
export const FAIL_HOLD_MS = 1100;
