import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import { colors, fonts, radius } from '../../styles';

export default function NoAbsencesCard({ childName, onMarkPress }) {
  return (
    <Card style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="check-circle-outline" size={24} color={colors.liveGreen} />
      </View>
      <AppText variant="heading3" style={styles.title}>
        No upcoming absences marked
      </AppText>
      <AppText variant="bodySmall" style={styles.text}>
        Bus service will operate normally for {childName}.
      </AppText>
      <Pressable
        onPress={onMarkPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <MaterialIcons name="add" size={16} color={colors.primaryNavy} />
        <AppText variant="buttonSmall" color={colors.primaryNavy}>
          Mark Absent
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, alignItems: 'center' },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.liveGreenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bold, fontSize: 14.5, marginTop: 12 },
  text: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pressed: { backgroundColor: colors.inputFill },
});

