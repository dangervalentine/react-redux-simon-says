/**
 * Two-line LCD: the record on top, the live score below.
 *
 * Both lines sit inside the panel rather than the high score floating above
 * it — the segmented display font only reads as a display against the dark
 * screen, and on the slate face it just looked like broken lettering.
 *
 * `888` is painted underneath the score at low alpha as the unlit "ghost"
 * segments a real LCD shows. Without it the panel reads as an empty hole on
 * a dark ground rather than a display that's switched on.
 *
 * The caption underneath is the game's only running commentary — watch /
 * your turn / game over — which is what turns a board that has simply
 * stopped responding into one that's telling you whose turn it is.
 */
const status = ({ isFailing, isReplaying, isPlaying }) => {
  if (isFailing) return { text: 'game over', tone: 'fail' };
  if (isReplaying) return { text: 'watch', tone: 'replay' };
  if (isPlaying) return { text: 'your turn', tone: 'turn' };
  return { text: 'press start', tone: 'idle' };
};

const Score = ({
  score,
  hScore,
  isPlaying,
  isReplaying,
  isFailing,
  isNewRecord,
}) => {
  const { text, tone } = status({ isFailing, isReplaying, isPlaying });
  // A run that has caught the record is worth calling out while it happens.
  const atRecord = hScore !== '000' && score === hScore;
  // The moment it's beaten — not merely matched — the HI line blinks and
  // says so.
  const hiClass = [
    'screen-hi',
    atRecord && 'screen-hi-matched',
    isNewRecord && 'screen-hi-new',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="game-score">
      <span
        className={`game-screen ${isPlaying || isFailing ? 'screen-on' : 'screen-off'}`}
      >
        <span
          className={hiClass}
          aria-label={`${isNewRecord ? 'New high score' : 'High score'} ${parseInt(hScore, 10)}`}
        >
          <span aria-hidden="true">
            {isNewRecord ? 'new' : 'hi'} {hScore}
          </span>
        </span>

        <span className="screen-main">
          <span className="screen-ghost" aria-hidden="true">
            888
          </span>
          <span className="screen-value">{score}</span>
        </span>
      </span>

      <span className={`game-status game-status-${tone}`} role="status">
        {text}
      </span>
    </div>
  );
};

export default Score;
