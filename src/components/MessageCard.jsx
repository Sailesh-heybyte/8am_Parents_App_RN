import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from './AppText';
import Card from './Card';
import { colors } from '../styles';

export default function MessageCard({ icon, text }) {
  return (
    <Card style={styles.card}>
      <MaterialIcons name={icon} size={24} color={colors.textSecondary} />
      <AppText variant="bodySmall" style={styles.text}>
        {text}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1 },
});

