import client from './client';

function toTrip(item) {
  return {
    id: item.trip_id || '',
    date: item.trip_date || '',
    direction: item.direction || '',
    routeName: item.route_name || '',
    registrationNumber: item.registration_number || '',
    outcome: item.outcome || '',
  };
}

export async function getTripHistory(studentId) {
  const { data } = await client.get(`/api/v1/trips/children/${studentId}/history`);
  return Array.isArray(data) ? data.map(toTrip) : [];
}
