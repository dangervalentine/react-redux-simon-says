import pad1 from './sounds/pad1.wav';
import pad2 from './sounds/pad2.wav';
import pad3 from './sounds/pad3.wav';
import pad4 from './sounds/pad4.wav';
import fail from './sounds/fail.wav';
import round from './sounds/round.wav';

/**
 * Indices 0-3 are the four pad tones, paired by position with the pad colours
 * in theme.js — pad 2's colour and pad 2's note share an index. Index 4 is
 * the fail cue, 5 the round-complete chime.
 *
 * Every file is synthesised by scripts/make-sounds.sh; edit and rerun that
 * rather than replacing a file by hand, so the set stays level-matched.
 */
export const sounds = [pad1, pad2, pad3, pad4, fail, round];
