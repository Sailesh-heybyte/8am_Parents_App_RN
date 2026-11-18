import React, { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import AppButton from '../../components/AppButton';
import AppText from '../../components/AppText';
import AppTextInput from '../../components/AppTextInput';
import Card from '../../components/Card';
import ChildPickerSheet from '../../components/ChildPickerSheet';
import { createComplaint } from '../../api/complaints';
import { useSnackbar } from '../../context/SnackbarContext';
import { getErrorMessage } from '../../utils/errors';
import { colors, fonts, radius } from '../../styles';

const CATEGORIES = [
  { label: 'Transport', value: 'transport' },
  { label: 'Delay', value: 'delay' },
  { label: 'Driver / Staff', value: 'staff' },
  { label: 'Safety', value: 'safety' },
  { label: 'General', value: 'general' },
];

export default function NewComplaintForm({ childList, initialStudentId, onSubmitted }) {
  const showSnackbar = useSnackbar();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const padding = { paddingHorizontal: width < 380 ? 16 : 20 };

  const [studentId, setStudentId] = useState(initialStudentId ?? null);
  const [category, setCategory] = useState('transport');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedChild = childList.find(child => child.id === studentId);
  const childLabel = selectedChild
    ? selectedChild.stopName
      ? `${selectedChild.name} (${selectedChild.stopName})`
      : selectedChild.name
    : 'General / All Children';

  function clearError(field) {
    setErrors(current => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const next = {};
    if (!subject.trim()) next.subject = 'Subject is required';
    if (!description.trim()) next.description = 'Description is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsSubmitting(true);
    try {
      await createComplaint({
        subject: subject.trim(),
        description: description.trim(),
        category,
        studentId,
      });
      setSubject('');
      setDescription('');
      setErrors({});
      showSnackbar('Complaint submitted successfully!', 'success');
      onSubmitted();
    } catch (e) {
      showSnackbar(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.fill}
        contentContainerStyle={[styles.content, padding, { paddingBottom: 40 + insets.bottom }]}
      >
        <Card style={styles.card}>
          {childList.length > 0 && (
            <View style={styles.section}>
              <AppText variant="heading3" color={colors.textPrimary} style={styles.sectionLabel}>
                Select Child (Optional)
              </AppText>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => setPickerOpen(true)}
                style={styles.childField}
              >
                <MaterialIcons name="child-care" size={20} color={colors.textSecondary} />
                <AppText color={colors.textPrimary} numberOfLines={1} style={styles.childValue}>
                  {childLabel}
                </AppText>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
              </Pressable>
              <ChildPickerSheet
                visible={pickerOpen}
                title="Select Child"
                noneLabel="General / All Children"
                showStop
                selectedId={studentId}
                childList={childList}
                onClose={() => setPickerOpen(false)}
                onSelect={c => {
                  setStudentId(c ? c.id : null);
                  setPickerOpen(false);
                }}
              />
            </View>
          )}

          <View style={styles.section}>
            <AppText variant="heading3" color={colors.textPrimary} style={styles.sectionLabel}>
              Category
            </AppText>
            <View style={styles.chips}>
              {CATEGORIES.map(item => {
                const selected = item.value === category;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    disabled={isSubmitting}
                    onPress={() => setCategory(item.value)}
                    style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}
                  >
                    <AppText
                      variant="label"
                      color={selected ? colors.surfaceWhite : colors.textPrimary}
                      style={selected ? styles.chipTextSelected : styles.chipText}
                    >
                      {item.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <AppText variant="heading3" color={colors.textPrimary} style={styles.sectionLabel}>
              Subject
            </AppText>
            <AppTextInput
              icon="title"
              placeholder="e.g. Bus was late"
              value={subject}
              onChangeText={text => {
                setSubject(text);
                clearError('subject');
              }}
              error={errors.subject}
              editable={!isSubmitting}
              maxLength={120}
              returnKeyType="next"
            />
          </View>

          <AppText variant="heading3" color={colors.textPrimary} style={styles.sectionLabel}>
            Description
          </AppText>
          <AppTextInput
            icon="description"
            multiline
            placeholder="e.g. The morning bus arrived about 20 minutes late today."
            value={description}
            onChangeText={text => {
              setDescription(text);
              clearError('description');
            }}
            error={errors.description}
            editable={!isSubmitting}
            maxLength={1000}
          />

          <AppButton
            title="Submit"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={<MaterialIcons name="send" size={17} color={colors.surfaceWhite} />}
            style={styles.submit}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    paddingTop: 24,
  },
  card: {
    padding: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13.5,
    marginBottom: 8,
  },
  childField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.inputFill,
  },
  childValue: {
    flex: 1,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  chipIdle: {
    backgroundColor: colors.neutralBadgeBg,
    borderColor: colors.cardBorder,
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
  chipTextSelected: {
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },
  submit: {
    marginTop: 24,
  },
});
