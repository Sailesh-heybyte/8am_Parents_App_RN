import client from './client';

function toTrip(item) {
  return {
    id: item.trip_id || '',
    date: item.trip_date || '',
    direction: item.direction || '',
    routeName: item.route_name || '',
    registrationNumber: item.registration_number || '',
    outcome: item.outcome || '',
    driverName: item.driver_name || '',
    stopName: item.stop_name || '',
    startedAt: item.started_at || null,
    endedAt: item.ended_at || null,
    boardedAt: item.boarded_at || null,
    deboardedAt: item.deboarded_at || null,
    boardSource: item.board_source || '',
    deboardSource: item.deboard_source || '',
    messages: (item.messages || []).map(m => ({
      type: m.type || '',
      message: m.message || '',
      createdAt: m.created_at || null,
    })),
  };
}

export async function getTripHistory(studentId) {
  const { data } = await client.get(`/api/v1/trips/children/${studentId}/history`);
  return Array.isArray(data) ? data.map(toTrip) : [];
}

export async function getTripDetail(studentId, tripId) {
  const { data } = await client.get(`/api/v1/trips/children/${studentId}/trips/${tripId}`);
  return toTrip(data);
}
