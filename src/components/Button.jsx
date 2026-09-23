import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { playTone, stopTone } from '../audio';
import { PAD_LIT_MS, PAD_PRESS_MS } from '../timing';

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
  // Physical push, only for the player's own presses — playback lights a pad
  // but nobody touched it, so it shouldn't move.
  const [pressed, setPressed] = useState(false);
  const timerRef = useRef(null);
  const pressTimerRef = useRef(null);
  const toneRef = useRef(null);

  // `ms` lets playback shorten the light as the sequence speeds up; `tone`
  // off is for the silent "this one" blinks under the fail cue.
  const flash = useCallback(
    ({ ms = PAD_LIT_MS, tone = true } = {}) => {
      setLit(true);
      stopTone(toneRef.current);
      toneRef.current = tone ? playTone(index) : null;

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setLit(false);
        stopTone(toneRef.current);
        toneRef.current = null;
      }, ms);
    },
    [index],
  );

  const handlePress = useCallback(() => {
    if (inputPause || !isPlaying) return;
    flash();
    setPressed(true);
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => setPressed(false), PAD_PRESS_MS);
    onPress(index);
  }, [inputPause, isPlaying, flash, onPress, index]);

  // `press` is the number-key hotkey's way in: the same path as a click, so
  // a keyed press gets the push, the light, the tone and the playback guard.
  useImperativeHandle(ref, () => ({ flash, press: handlePress }), [flash, handlePress]);

  // Don't leave a tone ringing or a timer pending if the board unmounts.
  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      clearTimeout(pressTimerRef.current);
      stopTone(toneRef.current);
    },
    [],
  );

  return (
    <button
      type="button"
      className={`button${lit ? ' lit' : ''}${pressed ? ' pressed' : ''}`}
      style={{ backgroundColor: color }}
      onClick={handlePress}
      // aria-disabled, not disabled: a disabled button drops focus, so a
      // keyboard player lost their place every round when playback paused
      // input. handlePress already ignores presses then. Out of the Tab
      // order entirely while no game is running, so Tab reaches the switch.
      aria-disabled={!isPlaying || inputPause}
      tabIndex={isPlaying ? 0 : -1}
      aria-label={`Pad ${index + 1}`}
      aria-keyshortcuts={String(index + 1)}
    >
      <span className={`overlay${lit ? ' on' : ''}`} />
      {/* Hotkey badge. Always rendered; shown by .tips-on on the app. */}
      <kbd className="pad-key" aria-hidden="true">
        {index + 1}
      </kbd>
    </button>
  );
});

export default Button;
