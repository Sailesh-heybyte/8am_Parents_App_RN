export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
  if (!error?.response) return 'No internet connection. Please check your network.';

  const data = error.response.data;
  if (Array.isArray(data?.detail)) return data.detail[0]?.msg || fallback;
  return data?.detail || data?.message || data?.error || fallback;
}

