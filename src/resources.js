import firstSound from './sounds/simonSound1.mp3';
import secondSound from './sounds/simonSound2.mp3';
import thirdSound from './sounds/simonSound3.mp3';
import fourthSound from './sounds/simonSound4.mp3';
import fifthSound from './sounds/simonSound5.mp3';
import sixthSound from './sounds/success.flac';

/**
 * Indices 0-3 are the four pad tones, paired by position with the pad colours
 * in theme.js — pad 2's colour and pad 2's note share an index. Index 4 is
 * the failure buzz, 5 the round-complete chime.
 *
 * Pad colours used to live here too; they now come from theme.js so the
 * palette has exactly one home.
 */
export const sounds = [
  firstSound,
  secondSound,
  thirdSound,
  fourthSound,
  fifthSound,
  sixthSound,
];
