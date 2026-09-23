import { sounds } from './resources';

/**
 * Tone playback, on the Web Audio API.
 *
 * This used to be a pool of <audio> elements. Two things forced the move:
 *
 * - A tone has to be cut when its pad goes dark, and playback speeds up as
 *   the sequence grows, so tones get cut shorter and shorter. Pausing an
 *   <audio> element mid-waveform clicks. A gain node can ramp to silence
 *   over a few milliseconds instead.
 * - iOS ignores HTMLMediaElement.volume entirely, so any level set in code
 *   was silently full-scale on iPhones. Gain nodes work everywhere.
 *
 * Levels are baked into the files (scripts/make-sounds.sh); `volume` here is
 * only for deliberate one-off adjustments.
 *
 * Note that Web Audio follows the iOS ring/silent switch, where <audio> did
 * not: a muted phone now plays the game muted, like any other game.
 */

/** Indices into `sounds` that aren't pad tones. */
export const FAIL_TONE = 4;
export const ROUND_TONE = 5;

/** Fade applied when a tone is cut, long enough to be click-free. */
const STOP_FADE_S = 0.025;

let ctx = null;
const buffers = new Array(sounds.length).fill(null);

// Start downloading straight away, before there's a context to decode into:
// the bytes are ready by the time the player's first gesture creates one.
const downloads = sounds.map((src) =>
  fetch(src)
    .then((res) => res.arrayBuffer())
    .catch(() => null),
);

const decodeAll = () =>
  Promise.all(
    downloads.map(async (download, i) => {
      if (buffers[i]) return;
      const bytes = await download;
      if (!bytes) return;
      try {
        // decodeAudioData detaches the buffer it's given, and a second
        // primeAudio() would hand it the same one — so decode a copy.
        buffers[i] = await ctx.decodeAudioData(bytes.slice(0));
      } catch {
        /* an undecodable file is just a silent pad */
      }
    }),
  );

/**
 * Browsers won't start audio until the user has interacted with the page, so
 * the context is created and resumed on that first gesture — starting a
 * game, by switch or by key. Creating it earlier only gets a warning and a
 * suspended context.
 */
export const primeAudio = () => {
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  void decodeAll();
};

/**
 * Start a tone. Returns a handle for `stopTone`, or null if audio isn't
 * available yet (no gesture so far, or still decoding).
 */
export const playTone = (index, { volume = 1 } = {}) => {
  const buffer = buffers[index];
  if (!ctx || !buffer) return null;

  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start();

  const handle = { source, gain, stopped: false };
  source.onended = () => {
    handle.stopped = true;
  };
  return handle;
};

/** Fade a tone started by `playTone` to silence and stop it. */
export const stopTone = (handle) => {
  if (!handle || handle.stopped || !ctx) return;
  handle.stopped = true;
  const now = ctx.currentTime;
  const { gain, source } = handle;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + STOP_FADE_S);
  source.stop(now + STOP_FADE_S);
};
