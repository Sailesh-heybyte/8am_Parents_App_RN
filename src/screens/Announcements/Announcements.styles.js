import { StyleSheet } from 'react-native';
import { colors } from '../../styles';

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
