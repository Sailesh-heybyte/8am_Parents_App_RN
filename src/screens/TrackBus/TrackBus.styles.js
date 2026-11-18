import { StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
