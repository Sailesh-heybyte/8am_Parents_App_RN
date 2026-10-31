import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { colors, fonts, radius } from '../styles';

export default function AppTextInput({ icon, editable = true, style, ...rest }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.box, focused && styles.focused, !editable && styles.disabled, style]}>
      {icon && <MaterialIcons name={icon} size={20} color={colors.textSecondary} />}
      <TextInput
        style={styles.input}
        editable={editable}
        placeholderTextColor={colors.textSecondary}
        maxFontSizeMultiplier={1.3}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.inputFill,
  },
  focused: {
    borderColor: colors.primaryNavy,
    borderWidth: 1.6,
  },
  disabled: {
    backgroundColor: colors.inputFillDisabled,
    borderColor: colors.cardBorderSubtle,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
});

