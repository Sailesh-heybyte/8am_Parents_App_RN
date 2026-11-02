import client from './client';

function toIdentifier(phone) {
  return `+91-${phone}`;
}

export async function requestOtp(phone) {
  await client.post('/api/v1/iam/request-otp', { identifier: toIdentifier(phone) });
}

export async function verifyOtp(phone, code) {
  const { data } = await client.post('/api/v1/iam/verify-otp', {
    identifier: toIdentifier(phone),
    code: code.trim(),
  });
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenType: data.token_type,
  };
}

export async function getMe() {
  const { data } = await client.get('/api/v1/people/me');
  return {
    userId: data.user_id,
    fullName: data.full_name || 'Parent',
    schoolName: data.school_name || 'School',
  };
}
