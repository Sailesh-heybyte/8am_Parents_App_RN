import client from './client';

export function toAnnouncement(item = {}) {
  return {
    id: String(item.id ?? ''),
    title: item.title || '',
    body: item.body || '',
    priority: (item.priority || 'normal').toLowerCase(),
    createdAt: item.created_at || item.date || '',
  };
}

export async function getMyAnnouncements() {
  const { data } = await client.get('/api/v1/announcements/mine');
  return Array.isArray(data) ? data.map(toAnnouncement) : [];
}

