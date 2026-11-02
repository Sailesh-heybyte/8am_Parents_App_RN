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

