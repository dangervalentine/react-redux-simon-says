import { sounds } from './resources';

/**
 * Tone playback.
 *
 * Every press used to build a fresh `new Audio()`, set `currentTime` on it
 * before it had loaded (a no-op on an unloaded element, so the intended
 * trim never actually applied), and leave it to the GC. The first press of
 * each pad waited on a network fetch, which is why the opening tones of a
 * round arrived late or not at all.
 *
 * Now each tone is loaded once up front and replayed from a short pool of
 * clones, so a pad can be re-struck before its previous tone has finished
 * without either one cutting out.
 */

/** The samples open with a beat of silence; skip it so tones land on time. */
const TONE_OFFSET = 0.125;

/** Indices into `sounds` that aren't pad tones. */
export const FAIL_TONE = 4;
export const ROUND_TONE = 5;

const POOL_SIZE = 3;

const pools = sounds.map((src) =>
  Array.from({ length: POOL_SIZE }, () => {
    const el = new Audio(src);
    el.preload = 'auto';
    return el;
  }),
);

const cursors = sounds.map(() => 0);

const take = (index) => {
  const pool = pools[index];
  if (!pool) return null;
  const el = pool[cursors[index]];
  cursors[index] = (cursors[index] + 1) % pool.length;
  return el;
};

/**
 * Start a tone. Returns the element so the caller can stop it when the pad
 * goes dark — a tone that outlives its light is what made the old playback
 * feel out of sync with the board.
 */
export const playTone = (index, { volume = 1, offset = TONE_OFFSET } = {}) => {
  const el = take(index);
  if (!el) return null;

  el.volume = volume;
  try {
    el.currentTime = offset;
  } catch {
    // Safari throws if metadata hasn't loaded yet; the tone still plays from
    // the top, which is better than dropping it.
  }
  // A rejected play() is normal here (rapid re-press, or autoplay policy
  // before the first user gesture) and shouldn't reach the console.
  void el.play().catch(() => {});
  return el;
};

/** Stop and rewind a tone started by `playTone`. */
export const stopTone = (el) => {
  if (!el) return;
  el.pause();
  try {
    el.currentTime = TONE_OFFSET;
  } catch {
    /* nothing useful to do */
  }
};

/**
 * Browsers block audio until the user has interacted with the page. The
 * switch is that first interaction, so priming here means the very first
 * tone of the very first round plays rather than being silently dropped.
 */
export const primeAudio = () => {
  for (const pool of pools) {
    const el = pool[0];
    if (el.readyState === 0) el.load();
  }
};
