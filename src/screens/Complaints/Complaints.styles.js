import { StyleSheet } from 'react-native';
import { colors } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    marginTop: 16,
    marginBottom: 6,
  },
  panels: {
    flex: 1,
  },
  panel: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
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
