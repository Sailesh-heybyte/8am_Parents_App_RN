import { StyleSheet } from 'react-native';
import { colors } from '../../styles';

export default StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { paddingTop: 4, paddingBottom: 32 },
  separator: { height: 10 },
  loader: { flex: 1 },
  messageCard: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  messageText: { flex: 1 },
});

