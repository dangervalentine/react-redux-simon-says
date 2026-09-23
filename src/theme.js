/*
 * Night Owl — dark palette.
 *
 * The `colors` tree below is the shared design tokens' `dark` branch,
 * reproduced verbatim so this file stays diffable against the generated
 * source. Don't hand-tune values here; change them upstream and re-copy.
 *
 * Everything the app paints resolves through this module. `pads` holds the
 * selectable button colour schemes, `ui` names tokens for what they paint,
 * and `applyThemeVars()` pushes the whole tree onto :root as custom
 * properties so App.css draws from the identical source. Nothing outside
 * this file hardcodes a colour.
 */

export const colors = {
  primary: {
    light: '#AFC6FF',
    main: '#82AAFF',
    dark: '#4976A1',
  },
  secondary: {
    light: '#A3B7C7',
    main: '#8DA0AF',
    dark: '#2A3F51',
  },
  accent: {
    cyan: '#7fdbca',
    coral: '#FFAB70',
    green: '#C3E88D',
    pink: '#F07178',
    yellow: '#FFCB6B',
    purple: '#C792EA',
  },
  status: {
    playing: '#D4A44E',
    queued: '#4EA8C4',
    completed: '#6DAE6A',
    dropped: '#C87070',
    backlog: '#9878BE',
  },
  semantic: {
    success: '#C3E88D',
    warning: '#FFCB6B',
    error: '#F07178',
    info: '#82AAFF',
  },
  neutral: {
    white: '#FFFFFF',
    lightGray: '#D6DEEB',
    gray: '#637777',
    darkGray: '#1D3B53',
    black: '#000000',
  },
  background: {
    light: '#D6DEEB',
    medium: '#1D3B53',
    elevated: '#132A3E',
    surface: '#0A1E30',
    base: '#011627',
    card: '#011627',
    floor: '#010E18',
    scrim: 'rgba(1, 22, 39, 0.6)',
  },
  text: {
    primary: '#D6DEEB',
    secondary: '#9DB2C0',
    inverse: '#011627',
    muted: '#7E8E94',
  },
};

// ───────────────────────── colour helpers ─────────────────────────

/** Parse `#rgb` / `#rrggbb` into an [r, g, b] triple of 0-255 ints. */
const parseHex = (hex) => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

/** `#rrggbb` at the given opacity, as an `rgba()` string. */
export const alpha = (hex, a) => {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * Linear blend between two hex colours. `t` is how far to travel from `from`
 * toward `to` (0 = from, 1 = to). Used to derive lit and shaded variants
 * rather than hardcoding a second hue for every state.
 */
export const mix = (from, to, t) => {
  const a = parseHex(from);
  const b = parseHex(to);
  const ch = (i) => Math.round(a[i] + (b[i] - a[i]) * t);
  return `#${[ch(0), ch(1), ch(2)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
};

// ───────────────────────── pad schemes ─────────────────────────

const { accent, primary } = colors;

/**
 * The four Simon pads, as selectable schemes. The reset button cycles them.
 *
 * Order matters: index 0-3 maps to the four quadrants and to the four tones
 * in `sounds`, so a pad's colour and its note are paired by position.
 *
 * Every scheme has to satisfy one hard constraint — four colours a player can
 * tell apart instantly, at a glance, under a flashing overlay. The palette's
 * accents separate by hue *and* luminance, which is what makes that work for
 * colour-blind players too, rather than relying on hue alone.
 *
 * Scheme 0 maps the classic Simon red / yellow / green / blue onto the
 * nearest accents; 1 and 2 are variants. Each set spans the hue wheel rather
 * than grouping by temperature — a "cool set" or a "warm set" reads nicely as
 * a swatch strip but compresses the hue range, and two pads a shade apart is
 * a worse game.
 *
 * Specifically avoided: primary.main and primary.light in the same set. They
 * are the same blue at two lightnesses, which is exactly the pairing a player
 * can't resolve at a glance.
 */
export const colorSchemes = [
  [accent.pink, accent.yellow, accent.cyan, accent.purple],
  [accent.coral, accent.green, primary.main, accent.pink],
  [accent.cyan, accent.pink, accent.yellow, primary.main],
];

// ───────────────────────── UI palette ─────────────────────────

const { background, neutral, text } = colors;

/**
 * Tokens named for what they paint. Exported for anything that needs a colour
 * in JS; App.css reads the same values through the custom properties below.
 */
export const ui = {
  // The console itself, from the page inward.
  page: background.base,
  case: background.surface,
  bezel: background.elevated,
  face: background.medium,
  screen: background.floor,

  // Inset shadow inside the control disc. Much heavier than the light theme's
  // version — on a near-black ground a 45% black inset reads as nothing.
  inset: alpha(background.floor, 0.85),

  // A hairline of light along the top edge of raised parts. On a dark ground
  // a drop shadow has nothing to fall against, so this is what actually
  // reads as "raised".
  rim: alpha(text.primary, 0.1),
  edge: alpha(text.primary, 0.18),

  textPrimary: text.primary,
  textMuted: text.muted,
  wordmark: text.primary,

  // Status lights.
  lightOn: colors.semantic.success,
  lightOff: colors.semantic.error,
  lightDim: alpha(colors.semantic.error, 0.35),

  // The LCD. Lit segments in mint; unlit ones are the classic "ghost"
  // segments — the same colour at very low alpha, so the display reads as a
  // real seven-segment panel rather than empty space.
  screenOn: accent.cyan,
  screenIdle: text.secondary,
  // Dimmed display text — the high score, which shares the panel with the
  // live readout but must never compete with it. A mix rather than an alpha
  // so it stays legible against the screen's near-black rather than sinking
  // into it the way a low-opacity mint would.
  screenOffText: mix(accent.cyan, background.floor, 0.62),
  // Ghost segments have to stay well under the live value or "000" painted
  // over a "888" ghost just reads as 888.
  screenOff: alpha(accent.cyan, 0.09),

  // Controls.
  switchTrack: background.surface,
  switchToggle: text.primary,
  resetButton: colors.semantic.error,

  // Pad press flash, painted over whichever pad colour is active.
  flash: alpha(neutral.white, 0.55),
  flashFade: alpha(neutral.white, 0),
  // Halo around the console while it's the player's turn — the LCD's mint,
  // so the rim and the "your turn" readout say the same thing.
  turnGlow: alpha(accent.cyan, 0.32),

  // Hotkey badge floating on each pad. Dark glass rather than a solid chip,
  // so the pad's colour still reads through around the number.
  keycapFill: alpha(background.floor, 0.6),
  keycapEdge: alpha(text.primary, 0.35),

  // Corner attribution badge, matching the one in react-connect4.
  chipFill: alpha(background.elevated, 0.92),
  chipBorder: alpha(text.primary, 0.18),
  chipHover: background.medium,
  shadowSoft: alpha(background.floor, 0.45),
  focusRing: primary.main,
  accentLink: primary.main,
  accentLinkDim: primary.dark,
};

// ───────────────────────── CSS custom properties ─────────────────────────

/**
 * Flatten the token tree to `--no-<group>-<key>`, plus `--ui-*` for the
 * semantic names and the pre-composited alpha blends that plain CSS can't
 * derive on its own.
 */
export const cssVars = () => {
  const vars = {};

  for (const [group, entries] of Object.entries(colors)) {
    for (const [key, value] of Object.entries(entries)) {
      vars[`--no-${group}-${key}`] = value;
    }
  }

  for (const [key, value] of Object.entries(ui)) {
    vars[`--ui-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = value;
  }

  return vars;
};

/** Install the palette on :root. Called once, before the app mounts. */
export const applyThemeVars = (root = document.documentElement) => {
  for (const [name, value] of Object.entries(cssVars())) {
    root.style.setProperty(name, value);
  }
};
