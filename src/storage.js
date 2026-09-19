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
