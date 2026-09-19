import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from './components/Button';
import Controls from './components/Controls';
import GithubAttribution from './components/GithubAttribution';
import { FAIL_TONE, ROUND_TONE, playTone, primeAudio } from './audio';
import { delay } from './helpers';
import {
  FAIL_HOLD_MS,
  PAD_LIT_MS,
  PLAYBACK_GAP_MS,
  PLAYBACK_LEAD_MS,
} from './timing';
import { colorSchemes } from './theme';
import * as actionCreators from './actions/control';


const Container = () => {
  const dispatch = useDispatch();

  const score = useSelector((s) => s.score);
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
    playTone(FAIL_TONE, { volume: 0.5 });
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
    <div className={`App${isFailing ? ' is-failing' : ''}`}>
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
          isPlaying={isPlaying}
          isReplaying={isReplaying}
          isFailing={isFailing}
          startGame={startGame}
          changeColorScheme={changeColorScheme}
        />
      </div>

      <GithubAttribution />
    </div>
  );
};

export default Container;
