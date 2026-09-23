/**
 * Keyboard help: a corner toggle and the floating card it opens.
 *
 * The card appears on its own the moment the player reaches for the keyboard
 * and tucks away again when they go back to the mouse or a finger (Container
 * owns that logic). The toggle, or `?`, pins it on or off instead. The pad
 * number badges are shown by the same switch, via `.tips-on` on the app.
 *
 * The toggle sits bottom-left, opposite the GitHub badge, and wears the same
 * pill so the two corners read as a pair.
 */

// Kept terse: the card shares a corner with a console that fills most of
// a phone screen, and every character of width is a character of overlap.
const SHORTCUTS = [
  { keys: ['Space', 'Enter'], action: 'Start game' },
  { keys: ['1', '2', '3', '4'], action: 'Press pad' },
  { keys: ['Tab'], action: 'Move focus' },
  { keys: ['?'], action: 'Toggle tips' },
];

const KeyboardTips = ({ visible, onToggle }) => (
  <div className="keyboard-tips">
    <div
      id="keyboard-tips-card"
      className={`keyboard-tips-card${visible ? ' open' : ''}`}
      role="region"
      aria-label="Keyboard shortcuts"
      // Not `hidden` — that's display:none, which would kill the float-in.
      // CSS hides it with visibility once the fade-out has finished.
      aria-hidden={!visible}
    >
      <ul>
        {SHORTCUTS.map(({ keys, action }) => (
          <li key={action}>
            <span className="keyboard-tips-keys">
              {keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </span>
            <span className="keyboard-tips-action">{action}</span>
          </li>
        ))}
      </ul>
    </div>

    <button
      type="button"
      className="keyboard-tips-toggle"
      onClick={onToggle}
      aria-pressed={visible}
      aria-controls="keyboard-tips-card"
      aria-keyshortcuts="?"
    >
      {/* Keyboard glyph, inline for the same reason as the GitHub mark. */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 3h-13Zm0 1h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5ZM3 6v1h1V6H3Zm2 0v1h1V6H5Zm2 0v1h1V6H7Zm2 0v1h1V6H9Zm2 0v1h2V6h-2ZM3 8v1h2V8H3Zm3 0v1h1V8H6Zm2 0v1h1V8H8Zm2 0v1h1V8h-1Zm2 0v1h1V8h-1ZM4 10v1h8v-1H4Z" />
      </svg>
      <span>Keys</span>
    </button>
  </div>
);

export default KeyboardTips;
