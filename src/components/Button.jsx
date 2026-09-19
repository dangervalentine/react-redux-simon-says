import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { playTone, stopTone } from '../audio';
import { PAD_LIT_MS } from '../timing';

/**
 * One quadrant of the Simon board.
 *
 * The parent needs to light a pad during playback without the player having
 * touched it, so this exposes `flash()` through a ref. That's the pattern the
 * project was originally written to demonstrate — it used string refs
 * (`this.refs[i]`), which React 19 removed, so it's now a forwardRef plus
 * useImperativeHandle. Same idea, current API.
 *
 * The tone is stopped when the light goes out. Previously it played to its
 * full length regardless, so during fast playback the tones of consecutive
 * pads overlapped into a smear while the lights were already elsewhere.
 */
const Button = forwardRef(function Button(
  { index, color, isPlaying, inputPause, onPress },
  ref,
) {
  const [lit, setLit] = useState(false);
  const timerRef = useRef(null);
  const toneRef = useRef(null);

  const flash = useCallback(() => {
    setLit(true);
    stopTone(toneRef.current);
    toneRef.current = playTone(index);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLit(false);
      stopTone(toneRef.current);
      toneRef.current = null;
    }, PAD_LIT_MS);
  }, [index]);

  useImperativeHandle(ref, () => ({ flash }), [flash]);

  // Don't leave a tone ringing or a timer pending if the board unmounts.
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      stopTone(toneRef.current);
    },
    [],
  );

  const handlePress = () => {
    if (inputPause || !isPlaying) return;
    flash();
    onPress(index);
  };

  return (
    <button
      type="button"
      className={`button${lit ? ' lit' : ''}`}
      style={{ backgroundColor: color }}
      onClick={handlePress}
      disabled={!isPlaying || inputPause}
      aria-label={`Pad ${index + 1}`}
    >
      <span className={`overlay${lit ? ' on' : ''}`} />
    </button>
  );
});

export default Button;
