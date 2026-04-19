const STORAGE_KEY = 'ggdtools-admin-session';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getStoredSession() {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function persistSession(session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
    window.localStorage.removeItem(STORAGE_KEY);
}

async function request(path, options = {}) {
    const session = getStoredSession();
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    if (session?.token) {
        headers.set('Authorization', `Bearer ${session.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || '请求失败，请稍后重试');
    }

    return data;
}

export function login(payload) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function fetchCurrentUser() {
    return request('/auth/me');
}

export function fetchPageData(section, id) {
    return request(`/pages/${section}/${id}`);
}