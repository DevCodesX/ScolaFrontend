import { getAuthHeaders } from './authService';
import { apiUrl } from '../lib/api';

const API = apiUrl('/api/teacher-invitations');

export interface Invitation {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    subject?: string;
    phone?: string;
    status: 'pending' | 'accepted' | 'expired';
    expires_at: string;
    created_at: string;
}

export interface InvitePayload {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
    subject?: string;
}

export async function sendInvitation(data: InvitePayload) {
    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'فشل إرسال الدعوة');
    }
    return res.json();
}

export async function getInvitations(): Promise<Invitation[]> {
    const res = await fetch(API, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('فشل جلب الدعوات');
    return res.json();
}

export async function cancelInvitation(id: string) {
    const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('فشل إلغاء الدعوة');
}

export async function verifyToken(token: string) {
    const res = await fetch(`${API}/verify/${token}`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
    }
    return res.json();
}

export async function acceptInvitation(token: string, password: string) {
    const res = await fetch(`${API}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
    }
    return res.json();
}
