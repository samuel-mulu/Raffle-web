import { useAuthStore } from '@/stores/auth-store';
import { AuthResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

async function parseApiError(response: Response, fallback: string) {
  const error = await response.json().catch(() => ({ message: fallback }));
  return new Error(error.message || fallback);
}

async function refreshAccessToken() {
  const { refreshToken, user, setAuth, clearAuth } = useAuthStore.getState();

  if (!refreshToken || !user?.id) {
    clearAuth();
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.id,
      refreshToken,
    }),
  });

  if (!response.ok) {
    clearAuth();
    return null;
  }

  const data = (await response.json()) as AuthResponse;
  setAuth(data.accessToken, data.refreshToken, data.user);
  return data.accessToken;
}

async function fetchWithAuthRetry(
  path: string,
  options: RequestInit,
  retryOnUnauthorized = true,
) {
  const { accessToken, clearAuth } = useAuthStore.getState();
  const headers: HeadersInit = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status !== 401 || !retryOnUnauthorized) {
    return response;
  }

  const nextAccessToken = await refreshAccessToken();

  if (!nextAccessToken) {
    clearAuth();
    redirectToLogin();
    return response;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      Authorization: `Bearer ${nextAccessToken}`,
    },
  });
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  responseType: 'json' | 'blob' = 'json'
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetchWithAuthRetry(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
      redirectToLogin();
    }

    throw await parseApiError(response, 'API request failed');
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
  const response = await fetchWithAuthRetry(path, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();
      redirectToLogin();
    }

    throw await parseApiError(response, 'Download failed');
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
  postMultipart: async <T>(path: string, formData: FormData) => {
    const response = await fetchWithAuthRetry(path, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().clearAuth();
        redirectToLogin();
      }

      throw await parseApiError(response, 'API request failed');
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      throw new Error(getErrorMessage(null, 'Unexpected API response'));
    }

    return response.json() as Promise<T>;
  },
};
