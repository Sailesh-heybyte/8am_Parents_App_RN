import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    paddingHorizontal: 32,
    gap: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pink,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryButtonText: {
    color: colors.surfaceWhite,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  listContent: {
    paddingTop: 24,
    flexGrow: 1,
  },
  separator: {
    height: 14,
  },
  emptyState: {
    justifyContent: 'center',
  },
});
