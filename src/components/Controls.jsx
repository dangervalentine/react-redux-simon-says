import Score from './Score';
import ControlButtons from './ControlButtons';

/**
 * The centre disc: wordmark, score readout and the physical controls.
 *
 * The wordmark cycles the pad colours. It carries no label — it's meant to be
 * found, not advertised — so the only affordance is that it reacts to the
 * pointer. Hence a real button: hover and focus both animate it, and it's
 * reachable from the keyboard rather than being a mouse-only secret.
 */
const Controls = ({
  score,
  hScore,
  isPlaying,
  isReplaying,
  isFailing,
  startGame,
  changeColorScheme,
}) => (
  <div className="controls">
    <div className="game-name">
      <button
        type="button"
        className="name"
        onClick={changeColorScheme}
        aria-label="Change pad colours"
      >
        simon
      </button>
      <span className="game-name-buffer" />
    </div>

    <div className="game-controls">
      <Score
        score={score}
        hScore={hScore}
        isPlaying={isPlaying}
        isReplaying={isReplaying}
        isFailing={isFailing}
      />
      <ControlButtons
        isPlaying={isPlaying}
        startGame={startGame}
        changeColorScheme={changeColorScheme}
      />
    </div>
  </div>
);

export default Controls;
