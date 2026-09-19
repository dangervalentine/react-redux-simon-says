export const fetchRandomButtonIndex = () => Math.floor(Math.random() * 4);

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Next scheme index, wrapping at the end.
 *
 * Takes the current index and the count rather than the whole state. The old
 * version read `state.buttonColors.length` and advanced with
 * `++state.colorScheme`, which mutated the Redux state object in place before
 * the reducer built its replacement — it happened to work, but it's the one
 * thing a reducer must not do.
 */
export const getNextColorScheme = (current, total) => (current + 1) % total;

/** Advance the score and zero-pad it to three digits for the LCD. */
export const parseScore = (state) => {
  const next = parseInt(state.score, 10) + 1;
  const parsedScore =
    next < 10 ? `00${next}` : next < 100 ? `0${next}` : String(next);

  return {
    ...state,
    score: parsedScore,
    hScore: next > parseInt(state.hScore, 10) ? parsedScore : state.hScore,
  };
};
