import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from '../../components/AppText';
import Card from '../../components/Card';
import IconTile from '../../components/IconTile';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime } from '../../utils/date';
import { colors, fonts } from '../../styles';

const STATUS = {
  resolved: { labelKey: 'statusResolved', color: colors.liveGreen, bg: colors.liveGreenBg, icon: 'check-circle' },
  in_progress: { label: 'In Progress', color: colors.infoBlueDark, bg: colors.infoBlueBg, icon: 'pending-actions' },
  open: { label: 'Open', color: colors.warningOrange, bg: colors.warningOrangeBg, icon: 'hourglass-empty' },
};

export default function ComplaintCard({ complaint, childName }) {
  const { t } = useLanguage();
  const status = STATUS[complaint.status] || STATUS.open;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <IconTile size={44} bg={colors.primaryNavySubtle}>
          <MaterialIcons name="feedback" size={22} color={colors.primaryNavy} />
        </IconTile>
        <View style={styles.headerText}>
          <AppText variant="heading2" color={colors.textPrimary} style={styles.subject}>
            {complaint.subject}
          </AppText>
          <View style={styles.metaRow}>
            <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
              <MaterialIcons name={status.icon} size={12} color={status.color} />
              <AppText variant="heading3" color={status.color} style={styles.statusLabel}>
                {status.labelKey ? t(status.labelKey) : status.label}
              </AppText>
            </View>
            {complaint.category ? (
              <View style={styles.categoryPill}>
                <AppText variant="heading3" color={colors.textSecondary} style={styles.categoryLabel}>
                  {complaint.category.toUpperCase()}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <AppText color={colors.textSecondary} style={styles.description}>
        {complaint.description}
      </AppText>

      {complaint.resolutionNote ? (
        <View style={styles.resolution}>
          <View style={styles.resolutionHeader}>
            <MaterialIcons name="check-circle-outline" size={15} color={colors.liveGreen} />
            <AppText variant="heading3" style={styles.resolutionTitle}>
              Resolution Note
            </AppText>
          </View>
          <AppText style={styles.resolutionNote}>{complaint.resolutionNote}</AppText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <MaterialIcons name="calendar-today" size={12} color={colors.textSecondaryFaint} />
          <AppText variant="bodySmall" color={colors.textSecondarySoft} style={styles.dateText}>
            {formatDateTime(complaint.createdAt)}
          </AppText>
        </View>
        {childName ? (
          <View style={styles.childPill}>
            <MaterialIcons name="person" size={11} color={colors.primaryNavy} />
            <AppText variant="heading3" color={colors.primaryNavy} style={styles.childName}>
              {childName}
            </AppText>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerText: {
    flex: 1,
  },
  subject: {
    fontFamily: fonts.bold,
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  statusLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  categoryLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  description: {
    marginTop: 12,
    fontSize: 13.5,
    lineHeight: 19.5,
  },
  resolution: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.liveGreenPale,
    borderWidth: 1,
    borderColor: colors.liveGreenBorder,
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolutionTitle: {
    color: colors.liveGreen,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  resolutionNote: {
    marginTop: 4,
    color: colors.liveGreenText,
    fontSize: 12.5,
    lineHeight: 17.5,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11.5,
  },
  childPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.primaryNavySubtle,
  },
  childName: {
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
  },
});
