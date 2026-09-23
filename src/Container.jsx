import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from './components/Button';
import Controls from './components/Controls';
import Header from './components/Header';
import GithubAttribution from './components/GithubAttribution';
import KeyboardTips from './components/KeyboardTips';
import { loadTipsMode, saveTipsMode } from './storage';
import { FAIL_TONE, ROUND_TONE, playTone, primeAudio } from './audio';
import { delay } from './helpers';
import {
  FAIL_HOLD_MS,
  FAIL_VIBRATION,
  PAD_LIT_MS,
  PLAYBACK_GAP_MS,
  PLAYBACK_LEAD_MS,
} from './timing';
import { colorSchemes } from './theme';
import * as actionCreators from './actions/control';


const Container = () => {
  const dispatch = useDispatch();

  const score = useSelector((s) => s.score);
  const hScore = useSelector((s) => s.hScore);
  const isPlaying = useSelector((s) => s.isPlaying);
  const inputPause = useSelector((s) => s.inputPause);
  const colorScheme = useSelector((s) => s.colorScheme);
  const playbackSequence = useSelector((s) => s.playbackSequence);
  const lastEvent = useSelector((s) => s.lastEvent);

  // One handle per pad, so playback can light a pad the player hasn't
  // touched. Replaces the string refs (`this.refs[i]`) React 19 removed.
  const padRefs = useRef([]);

  // True while the board is replaying the sequence, so the UI can say so
  // rather than just going quietly unresponsive.
  const [isReplaying, setIsReplaying] = useState(false);
  const [isFailing, setIsFailing] = useState(false);

  const startGame = useCallback(() => {
    // The switch is the first user gesture on the page, which is exactly when
    // browsers will let us load audio. Priming here is what makes the first
    // tone of the first round actually play.
    primeAudio();
    dispatch(actionCreators.startGame());
  }, [dispatch]);

  const changeColorScheme = useCallback(
    () => dispatch(actionCreators.changeColorScheme()),
    [dispatch],
  );

  const buttonPress = useCallback(
    (index) => dispatch(actionCreators.buttonPress(index)),
    [dispatch],
  );

  // ── keyboard tips ──
  //
  // 'auto' shows the tips while the player is on the keyboard and hides them
  // once they touch the mouse or screen; the toggle (or `?`) pins them on or
  // off, and that choice is remembered.
  const [tipsMode, setTipsMode] = useState(loadTipsMode);
  const [usingKeyboard, setUsingKeyboard] = useState(false);
  const showTips =
    tipsMode === 'on' || (tipsMode === 'auto' && usingKeyboard);

  const toggleTips = useCallback(() => {
    const next = showTips ? 'off' : 'on';
    setTipsMode(next);
    saveTipsMode(next);
  }, [showTips]);

  useEffect(() => {
    // Clicking the toggle itself mustn't count as "went back to the mouse",
    // or auto mode would hide the card a beat before the click pins it.
    const onPointerDown = (e) => {
      if (e.target.closest?.('.keyboard-tips')) return;
      setUsingKeyboard(false);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // ── keyboard controls ──
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      setUsingKeyboard(true);

      if (e.key === '?') {
        e.preventDefault();
        toggleTips();
        return;
      }

      // 1-4 press the pads in reading order. `code` rather than `key` so the
      // top row works on layouts where it types symbols unshifted (AZERTY).
      const digit = /^(?:Digit|Numpad)([1-4])$/.exec(e.code);
      if (digit) {
        e.preventDefault();
        // A held key auto-repeats; one keystroke is one press.
        if (!e.repeat) padRefs.current[Number(digit[1]) - 1]?.press();
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        // Only while idle, and not mid fail-cue: the pending reset would end
        // the new game a second after it began.
        if (isPlaying || isFailing || e.repeat) return;
        // A focused button or link already acts on Space/Enter by itself,
        // so leave those alone. Pads are the exception — idle, they ignore
        // presses, so Space on a pad left focused after a loss starts a game.
        const target = e.target;
        const control = target.closest?.('button, a, input, select, textarea');
        if (control && !control.classList.contains('button')) return;
        e.preventDefault();
        startGame();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, isFailing, startGame, toggleTips]);

  // ── replay the sequence ──
  useEffect(() => {
    if (playbackSequence.length === 0) return undefined;

    // Guards against a sequence that's been superseded — a reset mid-playback
    // would otherwise keep lighting pads for the abandoned game.
    let cancelled = false;

    // Halt before the lead-in, not after it. The original waited the full
    // second first, which left the pads live during the pause right before
    // playback — a press there was accepted and immediately invalidated.
    dispatch(actionCreators.haltInput());
    setIsReplaying(true);

    const run = async () => {
      await delay(PLAYBACK_LEAD_MS);
      if (cancelled) return;

      for (const padIndex of playbackSequence) {
        if (cancelled) return;
        padRefs.current[padIndex]?.flash();
        await delay(PAD_LIT_MS + PLAYBACK_GAP_MS);
      }

      if (cancelled) return;
      setIsReplaying(false);
      dispatch(actionCreators.allowInput());
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [playbackSequence, dispatch]);

  // ── outcome cues ──
  //
  // The reducer records that a round completed or the player slipped; the
  // sound and the animation belong out here, where they can be sequenced
  // against each other.
  useEffect(() => {
    if (!lastEvent) return undefined;

    if (lastEvent.type === 'round') {
      playTone(ROUND_TONE, { volume: 0.6 });
      return undefined;
    }

    let cancelled = false;
    // Level is baked into the sample: the original was a full-scale square
    // wave that startled people even turned down here, so the file itself
    // was low-passed and dropped to sit well under the pad tones.
    playTone(FAIL_TONE);
    // Haptic bump in place of the old board shake. Optional chaining because
    // support is patchy — iOS Safari and desktop browsers have no vibrate().
    navigator.vibrate?.(FAIL_VIBRATION);
    setIsReplaying(false);
    setIsFailing(true);

    const timer = setTimeout(() => {
      if (cancelled) return;
      setIsFailing(false);
      dispatch(actionCreators.endGame());
    }, FAIL_HOLD_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lastEvent, dispatch]);

  return (
    <div className={`App${showTips ? ' tips-on' : ''}`}>
      <Header />

      <main className="stage">
        <div className="container">
          {colorSchemes[colorScheme].map((padColor, index) => (
            <Button
              key={index}
              ref={(el) => {
                padRefs.current[index] = el;
              }}
              index={index}
              color={padColor}
              isPlaying={isPlaying}
              inputPause={inputPause}
              onPress={buttonPress}
            />
          ))}

          <Controls
            score={score}
            hScore={hScore}
            isPlaying={isPlaying}
            isReplaying={isReplaying}
            isFailing={isFailing}
            startGame={startGame}
            changeColorScheme={changeColorScheme}
          />
        </div>
      </main>

      <KeyboardTips visible={showTips} onToggle={toggleTips} />
      <GithubAttribution />
    </div>
  );
};

export default Container;
