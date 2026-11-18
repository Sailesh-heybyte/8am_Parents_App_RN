import client from './client';

export async function registerDevice({ deviceId, fcmToken }) {
  await client.post('/api/v1/iam/me/devices', {
    device_id: deviceId,
    fcm_token: fcmToken,
    platform: 'android',
  });
}

export async function unregisterDevice(deviceId) {
  await client.delete(`/api/v1/iam/me/devices/${encodeURIComponent(deviceId)}`);
}
