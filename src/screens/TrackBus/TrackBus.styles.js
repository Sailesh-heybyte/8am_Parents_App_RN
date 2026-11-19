import { StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexShrink: 1,
    marginLeft: 12,
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
  demo: {
    position: 'absolute',
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surfaceWhite,
    ...shadows.card,
  },
  demoText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  bottom: {
    position: 'absolute',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  statusRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.liveGreen,
  },
  liveLabel: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  statusText: {
    flexShrink: 1,
    fontSize: 12,
  },
  endedLabel: {
    flexShrink: 1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceWhite,
    borderWidth: 2,
    borderColor: colors.primaryNavy,
    ...shadows.card,
  },
});
