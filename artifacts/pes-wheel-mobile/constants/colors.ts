/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#fff8eb',
    tint: '#f4c84f',
    background: '#09091d',
    foreground: '#fff8eb',
    card: '#17102f',
    cardForeground: '#fff8eb',
    primary: '#f4c84f',
    primaryForeground: '#28152f',
    secondary: '#2a1b48',
    secondaryForeground: '#fff1bb',
    muted: '#211533',
    mutedForeground: '#bdaecb',
    accent: '#8e3b9b',
    accentForeground: '#fff1a6',
    destructive: '#d85858',
    destructiveForeground: '#fff8eb',
    border: '#6c4c90',
    input: '#2a1b48',
    ink: '#09091d',
    panel: '#100c28',
    panelRaised: '#21153d',
    violet: '#71378f',
    violetBright: '#b05bd4',
    gold: '#f4c84f',
    goldSoft: '#ffe6a0',
    plum: '#28194c',
    green: '#2b9f81',
    blue: '#395fa4',
    orange: '#bd6d36',
    pink: '#973b68',
  },

  dark: {
    text: '#fff8eb',
    tint: '#f4c84f',
    background: '#09091d',
    foreground: '#fff8eb',
    card: '#17102f',
    cardForeground: '#fff8eb',
    primary: '#f4c84f',
    primaryForeground: '#28152f',
    secondary: '#2a1b48',
    secondaryForeground: '#fff1bb',
    muted: '#211533',
    mutedForeground: '#bdaecb',
    accent: '#8e3b9b',
    accentForeground: '#fff1a6',
    destructive: '#d85858',
    destructiveForeground: '#fff8eb',
    border: '#6c4c90',
    input: '#2a1b48',
    ink: '#09091d',
    panel: '#100c28',
    panelRaised: '#21153d',
    violet: '#71378f',
    violetBright: '#b05bd4',
    gold: '#f4c84f',
    goldSoft: '#ffe6a0',
    plum: '#28194c',
    green: '#2b9f81',
    blue: '#395fa4',
    orange: '#bd6d36',
    pink: '#973b68',
  },

  radius: 18,
};

export default colors;
