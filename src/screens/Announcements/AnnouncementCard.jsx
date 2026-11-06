import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import { formatDateTime } from '../../utils/date';
import { colors, fonts } from '../../styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIORITY = {
  urgent: { label: 'Urgent', color: '#D32F2F', bg: '#FFEBEE' },
  important: { label: 'Important', color: '#F57C00', bg: '#FFF3E0' },
  normal: { label: 'Notice', color: colors.primaryNavy, bg: '#E8EAF6' },
};

export default function AnnouncementCard({ announcement }) {
  const [expanded, setExpanded] = useState(false);

  function handlePress() {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setExpanded(v => !v);
  }

  const priority = PRIORITY[announcement?.priority] || PRIORITY.normal;
  const formattedDate = formatDateTime(announcement?.createdAt);

  return (
    <Card
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={[styles.accentBar, { backgroundColor: priority.color }]} />
        <View style={styles.contentColumn}>
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: priority.bg }]}>
              <AppText style={[styles.badgeText, { color: priority.color }]}>
                {priority.label}
              </AppText>
            </View>
            {Boolean(formattedDate) && (
              <AppText color={colors.textSecondary} style={styles.dateText}>
                {formattedDate}
              </AppText>
            )}
          </View>
          <AppText color={colors.textPrimary} style={styles.titleText}>
            {announcement?.title}
          </AppText>
        </View>
      </View>

      {Boolean(announcement?.body) && (
        <AppText
          color={colors.textSecondary}
          numberOfLines={expanded ? undefined : 2}
          style={[
            styles.bodyText,
            expanded ? styles.bodyExpanded : styles.bodyCollapsed,
          ]}
        >
          {announcement.body}
        </AppText>
      )}

      <MaterialIcons
        name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
        size={20}
        color={colors.textSecondary}
        style={styles.chevron}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  accentBar: {
    width: 4,
    minHeight: 44,
    borderRadius: 8,
  },
  contentColumn: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
  dateText: {
    fontSize: 11.5,
  },
  titleText: {
    marginTop: 8,
    fontFamily: fonts.bold,
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  bodyText: {
    marginLeft: 16,
    fontSize: 13.5,
    lineHeight: 21,
  },
  bodyCollapsed: {
    marginTop: 6,
  },
  bodyExpanded: {
    marginTop: 12,
  },
  chevron: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
});

