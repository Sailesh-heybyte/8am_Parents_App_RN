
import client from './client';

function toChild(item) {
  return {
    id: item.student_id || item.id || '',
    name: item.full_name || item.name || '',
    rollNo: item.admission_number || '',
    stopName: item.stop_name || '',
    routeName: item.route_name || '',
    busId: item.bus_id || null,
    homeLatitude: item.home_latitude ?? null,
    homeLongitude: item.home_longitude ?? null,
  };
}

export async function getChildren() {
  const { data } = await client.get('/api/v1/people/me/children');
  return Array.isArray(data) ? data.map(toChild) : [];
}

function toSettings(data) {
  return {
    amLeadMinutes: data.am_notify_lead_minutes ?? 15,
    pmLeadMinutes: data.pm_notify_lead_minutes ?? 15,
  };
}

export async function getNotificationSettings(studentId) {
  const { data } = await client.get(`/api/v1/people/me/children/${studentId}/notification-settings`);
  return toSettings(data);
}

export async function updateNotificationSettings(studentId, { amLeadMinutes, pmLeadMinutes }) {
  const body = {};
  if (amLeadMinutes != null) body.am_notify_lead_minutes = amLeadMinutes;
  if (pmLeadMinutes != null) body.pm_notify_lead_minutes = pmLeadMinutes;
  const { data } = await client.patch(
    `/api/v1/people/me/children/${studentId}/notification-settings`,
    body,
  );
  return data && data.am_notify_lead_minutes != null ? toSettings(data) : getNotificationSettings(studentId);
}

