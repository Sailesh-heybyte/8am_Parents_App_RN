import { StyleSheet } from 'react-native';
import { colors, fonts, shadows } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  mapArea: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  pinLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 44,
  },
  pin: {
    textShadowColor: 'rgba(0, 0, 0, 0.28)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locate: {
    position: 'absolute',
    bottom: 16,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.surfaceWhite,
    ...shadows.card,
  },
  locatePressed: {
    backgroundColor: colors.inputFill,
  },
  locateText: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  panel: {
    paddingTop: 16,
    backgroundColor: colors.surfaceWhite,
    ...shadows.sheet,
  },
  field: {
    marginTop: 12,
  },
  save: {
    marginTop: 12,
  },
});
