import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppText from './AppText';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';
import { colors, fonts, radius, shadows } from '../styles';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();
  const pillRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const current = LANGUAGES.find(item => item.code === language) || LANGUAGES[0];

  function openMenu() {
    pillRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  function choose(code) {
    setLanguage(code);
    setOpen(false);
  }

  const menuWidth = Math.max(96, anchor?.width || 0);
  const menuLeft = anchor ? Math.max(8, Math.min(anchor.x, screenWidth - menuWidth - 8)) : 0;

  return (
    <>
      <View ref={pillRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change language"
          onPress={openMenu}
          style={styles.pill}
        >
          <MaterialIcons name="language" size={15} color={colors.textSecondary} />
          <AppText variant="heading3" color={colors.textPrimary} style={styles.pillLabel}>
            {current.label}
          </AppText>
          <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          {anchor ? (
            <View style={[styles.menu, { top: anchor.y + anchor.height + 4, left: menuLeft, minWidth: menuWidth }]}>
              {LANGUAGES.map(item => {
                const selected = item.code === language;
                return (
                  <Pressable key={item.code} onPress={() => choose(item.code)} style={styles.menuRow}>
                    <AppText
                      variant="label"
                      color={selected ? colors.primaryNavy : colors.textPrimary}
                      style={selected ? styles.menuTextSelected : styles.menuText}
                    >
                      {item.label}
                    </AppText>
                    {selected ? <MaterialIcons name="check" size={16} color={colors.primaryNavy} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWhite,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  pillLabel: {
    fontSize: 13,
  },
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    minWidth: 96,
    backgroundColor: colors.surfaceWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  menuText: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  menuTextSelected: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
});
