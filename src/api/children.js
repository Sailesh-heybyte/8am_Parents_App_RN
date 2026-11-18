
import client from './client';

function toChild(item) {
  return {
    id: item.student_id || item.id || '',
    name: item.full_name || item.name || '',
    rollNo: item.admission_number || '',
    stopName: item.stop_name || '',
    routeName: item.route_name || '',
    busId: item.bus_id || null,
    stopId: item.stop_id || null,
    homeLatitude: item.home_latitude ?? null,
    homeLongitude: item.home_longitude ?? null,
  };
}

function toStop(stop) {
  return {
    id: stop.id || '',
    name: stop.name || '',
    sequence: stop.sequence ?? 0,
    latitude: stop.latitude ?? 0,
    longitude: stop.longitude ?? 0,
  };
}

function toRoute(data) {
  return {
    routeId: data.route_id || '',
    routeName: data.route_name || '',
    direction: (data.direction || '').toUpperCase(),
    start: [data.start_lng ?? 0, data.start_lat ?? 0],
    end: [data.end_lng ?? 0, data.end_lat ?? 0],
    driverName: data.driver_name || '',
    driverPhone: data.driver_phone || '',
    stops: Array.isArray(data.stops) ? data.stops.map(toStop) : [],
  };
}

export async function getChildRoute(studentId) {
  const { data } = await client.get(`/api/v1/people/me/children/${studentId}/route`);
  return toRoute(data);
}

export async function getChildren() {
  const { data } = await client.get('/api/v1/people/me/children');
  return Array.isArray(data) ? data.map(toChild) : [];
}

function toSettings(data) {
  return {
    amLeadMinutes: data.am_notify_lead_minutes ?? 15,
    pmLeadMinutes: data.pm_notify_lead_minutes ?? 15,
    homeLatitude: data.home_latitude ?? null,
    homeLongitude: data.home_longitude ?? null,
    homeAddress: data.home_address || '',
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

export async function updateHomeLocation(studentId, { latitude, longitude, address }) {
  const { data } = await client.patch(
    `/api/v1/people/me/children/${studentId}/notification-settings`,
    { home_latitude: latitude, home_longitude: longitude, home_address: address },
  );
  return data && data.home_latitude != null ? toSettings(data) : getNotificationSettings(studentId);
}

