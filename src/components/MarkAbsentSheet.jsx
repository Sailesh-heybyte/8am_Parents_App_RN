import React, { useState } from 'react';
import BottomSheet from './BottomSheet';
import MarkAbsentForm from './MarkAbsentForm';
import { markAbsent } from '../api/absences';
import { getErrorMessage } from '../utils/errors';
import { useSnackbar } from '../context/SnackbarContext';

export default function MarkAbsentSheet({ child, existing, absences, visible, onClose, onSaved, onCancelAbsence }) {
  const showSnackbar = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleClose() {
    setError('');
    onClose();
  }

  async function handleSubmit(values) {
    setSaving(true);
    setError('');
    try {
      await markAbsent(child.id, values);
      if (onSaved) {
        await onSaved();
      }
      handleClose();
      showSnackbar('Absence recorded successfully.', 'success');
    } catch (e) {
      setError(getErrorMessage(e, "Couldn't update the absence. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      {child && (
        <MarkAbsentForm
          child={child}
          existing={existing}
          absences={absences}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onCancelAbsence={onCancelAbsence}
          loading={saving}
          error={error}
        />
      )}
    </BottomSheet>
  );
}
