import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import AppText from './AppText';
import AppButton from './AppButton';
import { colors, fonts, radius } from '../styles';

export default function ConfirmDialog({
  visible,
  title,
  message,
  icon,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.titleRow}>
            {icon && <View style={[styles.iconCircle, destructive && styles.iconDanger]}>{icon}</View>}
            <AppText variant="heading2" style={styles.title}>
              {title}
            </AppText>
          </View>
          <AppText color={colors.textSecondary} style={styles.message}>
            {message}
          </AppText>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} disabled={loading} hitSlop={6} style={styles.cancelButton}>
              <AppText variant="bodySmall" style={styles.cancelText}>
                {cancelLabel}
              </AppText>
            </Pressable>
            <AppButton
              title={confirmLabel}
              loading={loading}
              onPress={onConfirm}
              style={[styles.confirm, destructive && styles.confirmDanger]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
  },
  dialog: {
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surfaceWhite,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralBadgeBg,
  },
  iconDanger: { backgroundColor: colors.errorRedBg },
  title: { flex: 1, fontFamily: fonts.bold },
  message: { fontSize: 13.5, lineHeight: 19.5, marginTop: 14 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 20 },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 10 },
  cancelText: { fontFamily: fonts.semiBold },
  confirm: { width: 'auto', height: 42, paddingHorizontal: 16, borderRadius: radius.md },
  confirmDanger: { backgroundColor: colors.errorRed },
});
