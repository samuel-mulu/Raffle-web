import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  responseType: 'json' | 'blob' = 'json'
): Promise<T> {
  const { accessToken, clearAuth } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const error = await response
      .json()
      .catch(() => ({ message: 'An error occurred' }));

    throw new Error(error.message || 'API request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(getErrorMessage(null, 'Unexpected API response'));
  }

  return response.json();
}

async function download(path: string) {
  const { accessToken, clearAuth } = useAuthStore.getState();

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    const error = await response
      .json()
      .catch(() => ({ message: 'Download failed' }));

    throw new Error(error.message || 'Download failed');
  }

  const disposition = response.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename=\"?([^"]+)\"?/i);

  return {
    blob: await response.blob(),
    fileName: fileNameMatch?.[1] || null,
  };
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  getBlob: (path: string) =>
    request<Blob>(path, { method: 'GET' }, 'blob'),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  download,
};
