import client from './client';

function toAbsence(item) {
  return {
    id: item.id || '',
    studentId: item.student_id || '',
    date: item.absence_date || '',
    direction: (item.direction || 'BOTH').toUpperCase(),
    reason: item.reason || '',
  };
}

export async function getAbsences(studentId) {
  const { data } = await client.get(`/api/v1/people/students/${studentId}/absences`);
  return Array.isArray(data) ? data.map(toAbsence) : [];
}

