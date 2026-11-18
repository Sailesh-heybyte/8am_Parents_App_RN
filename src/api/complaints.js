import client from './client';

const STATUS = { in_progress: 'in_progress', inprogress: 'in_progress', resolved: 'resolved' };

function toComplaint(item) {
  return {
    id: String(item.id ?? item._id ?? ''),
    subject: item.subject || '',
    description: item.description || '',
    status: STATUS[(item.status || '').toLowerCase()] || 'open',
    category: item.category || '',
    studentId: item.student_id || null,
    resolutionNote: item.resolution_note || '',
    createdAt: item.created_at || '',
  };
}

export async function getMyComplaints() {
  const { data } = await client.get('/api/v1/complaints/mine');
  return Array.isArray(data) ? data.map(toComplaint) : [];
}
