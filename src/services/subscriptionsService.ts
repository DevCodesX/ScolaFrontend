import { getAuthHeaders } from './authService';

const API_URL = `${import.meta.env.VITE_API_URL}/api/subscriptions`;

export interface Subscription {
    id: string;
    student_id: string;
    course_id: string;
    course_title: string;
    course_description: string;
    price: number;
    status: 'active' | 'cancelled' | 'expired';
    expires_at: string;
    created_at: string;
}

export async function subscribe(course_id: string): Promise<{ message: string; subscriptionId: string }> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ course_id }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to subscribe");
    }
    return res.json();
}

export async function getMySubscriptions(): Promise<Subscription[]> {
    const res = await fetch(API_URL, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch subscriptions");
    return res.json();
}

export async function cancelSubscription(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/${id}/cancel`, {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to cancel subscription");
    }
    return res.json();
}
