/**
 * The three physical controls on the console face: a power lamp, a
 * start/stop switch, and the button that cycles the pad colour scheme.
 *
 * Each control is labelled. The switch is the only way to start a game, and
 * with no label it was just an unmarked rectangle — nothing on the console
 * said which part to touch first. While the game is off it also pulses, so
 * the eye lands on it.
 *
 * The switch toggle used to animate via `react-css-transition`, which is
 * unmaintained and relies on the legacy context API that React 19 dropped.
 * It's now a class toggle with a CSS transition — same slide, no dependency.
 *
 * These were <div onClick> before. They're real buttons now, so they're
 * reachable by keyboard and announced properly.
 */
const ControlButtons = ({ isPlaying, startGame, changeColorScheme }) => (
  <div className="control-buttons">
    {/*
      No caption. Labelling this one spelled out what was meant to be found by
      poking at the console — the wordmark above does the same job and reacts
      to the pointer, which is affordance enough.
    */}
    <div className="control control-colour">
      <button
        type="button"
        className="game-reset"
        onClick={changeColorScheme}
        aria-label="Change pad colours"
      />
    </div>

    <div className="control control-start">
      <button
        type="button"
        className={`game-switch${isPlaying ? ' on' : ' idle'}`}
        onClick={startGame}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Stop game' : 'Start game'}
      >
        <span className={`game-switch-toggle${isPlaying ? ' on' : ''}`} />
      </button>
      <span className="control-label">{isPlaying ? 'stop' : 'start'}</span>
    </div>

    {/*
      No caption on the lamp. The disc narrows toward the bottom, and a third
      label was wide enough to collide with its own lamp and run past the
      curved edge — and a lit indicator explains itself anyway. The accessible
      name still carries the state.
    */}
    <div className="control control-power">
      <div
        className={`game-light ${isPlaying ? 'game-light-on' : 'game-light-off'}`}
        role="status"
        aria-label={isPlaying ? 'Game running' : 'Game stopped'}
      />
    </div>
  </div>
);

export default ControlButtons;
