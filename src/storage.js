const KEY = 'simon-says:high-score';

/** Scores are three-digit strings everywhere else; keep that shape. */
const isScore = (v) => typeof v === 'string' && /^\d{3,}$/.test(v);

/**
 * Read the stored high score.
 *
 * Every access is guarded: localStorage throws outright in some contexts
 * (Safari private mode, embedded webviews, storage disabled by policy)
 * rather than simply returning null, and a high score is never worth
 * breaking the page over.
 */
export const loadHighScore = () => {
  try {
    const stored = window.localStorage.getItem(KEY);
    return isScore(stored) ? stored : '000';
  } catch {
    return '000';
  }
};

export const saveHighScore = (value) => {
  if (!isScore(value)) return;
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* nothing useful to do — the session's score still shows */
  }
};

const TIPS_KEY = 'simon-says:keyboard-tips';

/**
 * Keyboard tips preference. 'auto' (the default) shows them while the player
 * is using the keyboard; 'on' and 'off' are what the toggle pins them to.
 */
const TIPS_MODES = ['auto', 'on', 'off'];

export const loadTipsMode = () => {
  try {
    const stored = window.localStorage.getItem(TIPS_KEY);
    return TIPS_MODES.includes(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
};

export const saveTipsMode = (mode) => {
  if (!TIPS_MODES.includes(mode)) return;
  try {
    window.localStorage.setItem(TIPS_KEY, mode);
  } catch {
    /* the toggle still works for this session */
  }
};
