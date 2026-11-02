import { StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceWhite,
    ...shadows.card,
  },
  routeText: {
    fontFamily: fonts.semiBold,
  },
  summaryCard: {
    marginTop: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#243B5A33',
    backgroundColor: '#243B5A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.primaryNavy,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 16,
  },
  childName: {
    fontSize: 18,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  trackingCard: {
    marginTop: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  busTile: {
    borderWidth: 1,
    borderColor: '#F59E0B4D',
  },
  trackingInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  trackingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.liveGreen,
  },
  trackingDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    marginTop: 24,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  stack: {
    gap: 10,
  },
});

