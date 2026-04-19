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

export function fetchMatchDetails(originalNameWithoutExt) {
    return request(`/pages/details/${encodeURIComponent(originalNameWithoutExt)}`);
}

// File Manager
export function fetchFiles() {
    return request('/files');
}

export function uploadFile(formData) {
    const session = getStoredSession();
    return fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
        body: formData,
    }).then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.message || '上传失败');
        return data;
    });
}

export function patchFile(id, description) {
    return request(`/files/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ description }),
    });
}

export function downloadFile(id, name) {
    const session = getStoredSession();
    return fetch(`${API_BASE_URL}/files/${id}/download`, {
        headers: session?.token ? { Authorization: `Bearer ${session.token}` } : {},
    }).then(async (r) => {
        if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.message || '下载失败'); }
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
    });
}

export function deleteFile(id) {
    return request(`/files/${id}`, { method: 'DELETE' });
}

// Replay CRUD
export function fetchReplays() {
    return request('/replays');
}

export function fetchReplay(id) {
    return request(`/replays/${id}`);
}

export function createReplay(payload) {
    return request('/replays', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function updateReplay(id, payload) {
    return request(`/replays/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}

export function deleteReplay(id) {
    return request(`/replays/${id}`, { method: 'DELETE' });
}