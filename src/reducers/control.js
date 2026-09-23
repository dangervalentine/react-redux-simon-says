import * as ControlActionTypes from "../actiontypes/control";
import { colorSchemes } from "../theme";
import {
  parseScore,
  getNextColorScheme,
  fetchRandomButtonIndex
} from "../helpers";

/**
 * Outcome signal for the view layer.
 *
 * Sounds used to be played from inside this reducer, which made it impure and
 * meant the audio fired at whatever moment the action happened to dispatch —
 * there was no way to sequence a cue against an animation. The reducer now
 * just records *that* something happened; Container decides how it sounds and
 * looks. The counter is what lets two identical outcomes in a row each
 * retrigger, since the object identity alone wouldn't change.
 */
const nextEvent = (state, type) => ({
  type,
  id: (state.lastEvent?.id ?? 0) + 1
});

// `buttonColors` used to be mirrored into state as a copy of the scheme list.
// The palette is a constant, not state — the component reads it straight from
// theme.js now, and only the selected index lives here.
// Exported so main.jsx can hand createStore a preloaded state with the
// persisted high score folded in, rather than the reducer reaching into
// localStorage itself.
export const initialState = {
  score: "000",
  hScore: "000",
  colorScheme: 0,
  isPlaying: false,
  inputPause: false,
  currentButton: null,
  playbackSequence: [],
  playerPlaybackSequence: [],
  lastEvent: null
};

export default function Control(state = initialState, action) {
  switch (action.type) {
    case ControlActionTypes.GAME_END: {
      return {
        ...state,
        score: "000",
        isPlaying: false,
        inputPause: false,
        currentButton: null,
        playbackSequence: [],
        playerPlaybackSequence: [],
        lastEvent: null
      };
    }

    case ControlActionTypes.GAME_START: {
      const playbackSequence = [
        ...state.playbackSequence,
        fetchRandomButtonIndex()
      ];

      if (state.isPlaying) {
        return Control(state, { type: ControlActionTypes.GAME_END });
      }

      return {
        ...state,
        isPlaying: true,
        playbackSequence
      };
    }

    case ControlActionTypes.ALLOW_INPUT: {
      return {
        ...state,
        inputPause: false
      };
    }

    case ControlActionTypes.HALT_INPUT: {
      return {
        ...state,
        inputPause: true
      };
    }

    case ControlActionTypes.BUTTON_PRESS: {
      const newPlayerPlaybackSequence = [
        ...state.playerPlaybackSequence,
        action.buttonIndex
      ];

      // Start at the end of the array and work back
      for (let i = newPlayerPlaybackSequence.length; i--; ) {
        if (state.playbackSequence[i] !== newPlayerPlaybackSequence[i]) {
          // A wrong press stops the game but deliberately does NOT clear the
          // board yet: the container plays the fail cue against the score the
          // player actually reached, then dispatches GAME_END to reset. The
          // old version reset in the same tick, so the number blinked away
          // before you could read it.
          // `expected` is the pad they should have pressed, so the fail cue
          // can show it rather than just announcing that they missed.
          return {
            ...state,
            isPlaying: false,
            inputPause: true,
            lastEvent: {
              ...nextEvent(state, "fail"),
              expected: state.playbackSequence[i]
            }
          };
        }
      }

      if (state.playbackSequence.length !== newPlayerPlaybackSequence.length) {
        return {
          ...state,
          playerPlaybackSequence: newPlayerPlaybackSequence
        };
      }

      return Control(
        { ...parseScore(state), lastEvent: nextEvent(state, "round") },
        { type: ControlActionTypes.ADD_TO_PLAYBACK_SEQUENCE }
      );
    }

    case ControlActionTypes.ADD_TO_PLAYBACK_SEQUENCE: {
      const newPlaybackSequence = [
        ...state.playbackSequence,
        fetchRandomButtonIndex()
      ];

      return {
        ...state,
        playerPlaybackSequence: [],
        playbackSequence: newPlaybackSequence
      };
    }

    case ControlActionTypes.GAME_CHANGE_COLOR_SCHEME: {
      return {
        ...state,
        colorScheme: getNextColorScheme(state.colorScheme, colorSchemes.length)
      };
    }

    default:
      return state;
  }
}
