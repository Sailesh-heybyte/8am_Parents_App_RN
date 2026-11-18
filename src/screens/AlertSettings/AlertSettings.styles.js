import { StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  pillText: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  content: {
    flexGrow: 1,
    paddingTop: 20,
    gap: 16,
  },
});
