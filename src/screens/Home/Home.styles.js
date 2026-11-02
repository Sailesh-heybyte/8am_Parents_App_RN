import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logout: {
    fontFamily: fonts.semiBold,
    color: colors.primaryNavy,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
  },
  countBadge: {
    borderRadius: 10,
  },
  separator: {
    height: 12,
  },
  loader: {
    marginVertical: 40,
  },
  stateText: {
    textAlign: 'center',
    marginVertical: 20,
  },
});

