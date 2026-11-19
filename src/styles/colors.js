function withAlpha(hex, alpha) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const palette = {
  white: '#FFFFFF',
  black: '#000000',

  navy: {
    50: '#E8EAF6',
    500: '#38577F',
    700: '#243B5A',
    800: '#18293E',
  },

  cream: {
    50: '#FAF8F5',
    100: '#F7F5F0',
    200: '#F2EFE9',
    300: '#F0ECE3',
    400: '#EFECE5',
    500: '#EEEAE1',
    600: '#EAE6DD',
  },

  ink: {
    300: '#9E9A95',
    500: '#686461',
    700: '#4A4643',
    900: '#1C1B1F',
  },

  gray: {
    50: '#F3F4F6',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
    600: '#616161',
    800: '#424242',
  },

  amber: {
    100: '#FEF3C7',
    500: '#F59E0B',
    800: '#92400E',
  },

  green: {
    50: '#F1F8E9',
    100: '#E8F5E9',
    200: '#C8E6C9',
    700: '#2E7D32',
    900: '#1B5E20',
  },

  emerald: {
    500: '#10B981',
  },

  blue: {
    50: '#E3F2FD',
    600: '#1976D2',
    700: '#1565C0',
  },

  sky: {
    600: '#0284C7',
  },

  orange: {
    50: '#FFF3E0',
    600: '#F57C00',
    800: '#E65100',
  },

  red: {
    50: '#FFEBEE',
    500: '#F44336',
    700: '#D32F2F',
  },

  rose: {
    600: '#E11D48',
  },

  pink: {
    50: '#FCE4EC',
    500: '#E91E63',
  },

  purple: {
    50: '#EDE7F6',
    700: '#512DA8',
  },

  slate: {
    500: '#64748B',
  },

  sage: {
    600: '#4A6B5D',
  },

  brown: {
    600: '#8B5E3C',
  },
};

export const colors = {
  primaryNavy: palette.navy[700],
  primaryNavyDark: palette.navy[800],
  primaryNavyLight: palette.navy[500],
  primaryNavySubtle: withAlpha(palette.navy[700], 0x14 / 255),
  primaryNavySelected: withAlpha(palette.navy[700], 0x1f / 255),
  primaryNavyBorder: withAlpha(palette.navy[700], 0x33 / 255),
  primaryNavyEmphasis: withAlpha(palette.navy[700], 0xcc / 255),

  background: palette.cream[50],
  surfaceWhite: palette.white,
  cardBorder: palette.cream[600],
  cardBorderSubtle: palette.cream[300],
  divider: palette.cream[500],
  inputFill: palette.cream[100],
  inputFillDisabled: palette.cream[400],

  textPrimary: palette.ink[900],
  textSecondary: palette.ink[500],
  textSecondaryFaint: withAlpha(palette.ink[500], 0x99 / 255),
  textSecondarySoft: withAlpha(palette.ink[500], 0xb3 / 255),
  textMuted: palette.ink[300],
  textEmphasis: withAlpha(palette.black, 0xde / 255),

  grayIcon: palette.gray[600],
  grayLabel: palette.gray[800],
  grayCounter: palette.gray[400],
  grayPlaceholder: palette.gray[300],
  grayBorder: palette.gray[200],
  grayChip: palette.gray[50],

  busYellow: palette.amber[500],
  busYellowLight: palette.amber[100],
  busYellowText: palette.amber[800],
  busYellowGlow: withAlpha(palette.amber[500], 0.22),
  busYellowBorder: withAlpha(palette.amber[500], 0x4d / 255),

  liveGreen: palette.green[700],
  liveGreenBg: palette.green[100],
  liveGreenText: palette.green[900],
  liveGreenPale: palette.green[50],
  liveGreenBorder: palette.green[200],

  infoBlue: palette.blue[600],
  infoBlueDark: palette.blue[700],
  infoBlueBg: palette.blue[50],

  warningOrange: palette.orange[800],
  warningOrangeBg: palette.orange[50],
  importantOrange: palette.orange[600],

  errorRed: palette.red[700],
  errorRedBg: palette.red[50],
  errorRedBright: palette.red[500],
  pink: palette.pink[500],
  pinkBg: palette.pink[50],

  neutralBadgeBg: palette.cream[200],
  neutralBadgeBgSoft: withAlpha(palette.cream[200], 0.6),
  neutralBadgeText: palette.ink[700],
  noticeBg: palette.navy[50],

  mapRoute: palette.sky[600],
  mapRoutePassed: palette.slate[500],
  mapStopStart: palette.emerald[500],
  mapStopDestination: palette.rose[600],

  eveningPurple: palette.purple[700],
  eveningPurpleBg: palette.purple[50],

  scrim: withAlpha(palette.black, 0.54),
  textShadow: withAlpha(palette.black, 0.28),
  borderFaint: withAlpha(palette.black, 0x14 / 255),
  shadowCard: withAlpha(palette.black, 0.04),
  shadowSheet: withAlpha(palette.black, 0.08),
};

export const avatarColors = [
  { color: palette.navy[700], background: withAlpha(palette.navy[700], 0x1f / 255) },
  { color: palette.sage[600], background: withAlpha(palette.sage[600], 0x1f / 255) },
  { color: palette.brown[600], background: withAlpha(palette.brown[600], 0x1f / 255) },
];
