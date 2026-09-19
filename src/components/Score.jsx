/**
 * Seven-segment style score readout.
 *
 * `888` is painted underneath at low alpha as the unlit "ghost" segments a
 * real LCD shows, with the live score on top. Without it the panel reads as
 * an empty hole on a dark ground rather than a display that's switched on.
 *
 * The caption underneath is the game's only running commentary — watch /
 * your turn / the final score — which is what turns a board that has simply
 * stopped responding into one that's telling you whose turn it is.
 */
const status = ({ isFailing, isReplaying, isPlaying }) => {
  if (isFailing) return { text: 'game over', tone: 'fail' };
  if (isReplaying) return { text: 'watch', tone: 'replay' };
  if (isPlaying) return { text: 'your turn', tone: 'turn' };
  return { text: 'press start', tone: 'idle' };
};

const Score = ({ score, isPlaying, isReplaying, isFailing }) => {
  const { text, tone } = status({ isFailing, isReplaying, isPlaying });

  return (
    <div className="game-score">
      <span
        className={`game-screen ${isPlaying || isFailing ? 'screen-on' : 'screen-off'}`}
      >
        <span className="screen-ghost" aria-hidden="true">
          888
        </span>
        <span className="screen-value">{score}</span>
      </span>
      <span className={`game-status game-status-${tone}`} role="status">
        {text}
      </span>
    </div>
  );
};

export default Score;
