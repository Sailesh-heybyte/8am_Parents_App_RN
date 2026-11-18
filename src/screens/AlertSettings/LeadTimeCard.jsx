import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import IconTile from '../../components/IconTile';
import { useLanguage } from '../../context/LanguageContext';
import { colors, fonts, radius } from '../../styles';

export default function LeadTimeCard({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  minutes,
  disabled,
  onPress,
}) {
  const { t } = useLanguage();
  const away = t('minutesAway', { minutes });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <IconTile size={46} bg={iconBg}>
          {icon}
        </IconTile>
        <AppText variant="heading3" color={colors.textPrimary} style={styles.title}>
          {title}
        </AppText>
      </View>
      <AppText color={colors.textSecondary} style={styles.description}>
        {description}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${away}. Change`}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.control,
          pressed && styles.controlPressed,
          disabled && styles.controlDisabled,
        ]}
      >
        <View>
          <AppText variant="label" color={colors.textSecondary} style={styles.radiusLabel}>
            {t('notificationRadius')}
          </AppText>
          <AppText variant="heading3" color={colors.primaryNavy} style={styles.radiusValue}>
            {away}
          </AppText>
        </View>
        <View style={styles.editBox}>
          <MaterialIcons name="edit" size={16} color={colors.primaryNavy} />
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  description: {
    marginTop: 12,
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  controlPressed: {
    backgroundColor: colors.inputFill,
  },
  controlDisabled: {
    opacity: 0.6,
  },
  radiusLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  radiusValue: {
    marginTop: 4,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  editBox: {
    padding: 7,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
