import { colors } from './colors';

export const fonts = {
  regular: 'GoogleSansFlex-Regular',
  medium: 'GoogleSansFlex-Medium',
  semiBold: 'GoogleSansFlex-SemiBold',
  bold: 'GoogleSansFlex-Bold',
};

export const typography = {
  greeting: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32.5, letterSpacing: -0.5, color: colors.textPrimary },
  heading1: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3, color: colors.textPrimary },
  heading2: { fontFamily: fonts.semiBold, fontSize: 16, letterSpacing: -0.2, color: colors.textPrimary },
  heading3: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.textPrimary },
  bodySecondary: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  bodySmall: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  button: { fontFamily: fonts.semiBold, fontSize: 15, letterSpacing: 0.1, color: colors.surfaceWhite },
  buttonSmall: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.surfaceWhite },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.textPrimary },
  badge: { fontFamily: fonts.semiBold, fontSize: 11.5, letterSpacing: 0.2 },
};

