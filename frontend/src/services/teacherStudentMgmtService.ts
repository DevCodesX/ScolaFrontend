import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/teacher-student-mgmt");

export interface ManagedStudent {
    id: string;
    user_id: string | null;
    teacher_id: string;
    student_name: string;
    student_email: string | null;
    student_phone: string | null;
    status: 'pending' | 'active' | 'suspended' | 'expired';
    access_expires_at: string | null;
    notes: string | null;
    days_remaining: number | null;
    created_at: string;
}

// ── Get all my students ──

export async function getMyStudentsList(): Promise<ManagedStudent[]> {
    const res = await fetch(API_URL, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("فشل في جلب قائمة الطلاب");
    return res.json();
}

// ── Approve student ──

export async function approveStudent(
    id: string,
    expiresInDays: number = 30
): Promise<{ message: string; student: ManagedStudent }> {
    const res = await fetch(`${API_URL}/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ expiresInDays }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في قبول الطالب");
    }
    return res.json();
}

// ── Reject student ──

export async function rejectStudent(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}/reject`, {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في رفض الطالب");
    }
}

// ── Extend subscription ──

export async function extendStudent(
    id: string,
    expiresInDays: number = 30
): Promise<{ message: string; newExpiresAt: string }> {
    const res = await fetch(`${API_URL}/${id}/extend`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ expiresInDays }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في تمديد الاشتراك");
    }
    return res.json();
}

// ── Suspend student ──

export async function suspendStudent(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}/suspend`, {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في إيقاف الطالب");
    }
}

// ── Reactivate student ──

export async function reactivateStudent(
    id: string,
    expiresInDays: number = 30
): Promise<{ message: string; newExpiresAt: string }> {
    const res = await fetch(`${API_URL}/${id}/reactivate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ expiresInDays }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في إعادة التفعيل");
    }
    return res.json();
}

// ── Get expiring students ──

export async function getExpiringStudents(days: number = 3): Promise<ManagedStudent[]> {
    const res = await fetch(`${API_URL}/expiring?days=${days}`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("فشل في جلب الطلاب المنتهية اشتراكاتهم");
    return res.json();
}

// ── Update notes ──

export async function updateStudentNotes(id: string, notes: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ notes }),
    });
    if (!res.ok) throw new Error("فشل في تحديث الملاحظات");
}
