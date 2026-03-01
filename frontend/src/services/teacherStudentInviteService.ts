import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/teacher-student-invites");

export interface InviteInfo {
    teacherName: string;
    subject: string;
    qualification: string;
    teacherId: string;
}

export interface GeneratedInvite {
    token: string;
    inviteUrl: string;
    expiresAt: string;
    maxUses: number;
    joinCode: string | null;
    teacherName: string;
}

export interface InviteToken {
    id: string;
    teacher_id: string;
    token: string;
    expires_at: string;
    max_uses: number;
    used_count: number;
    is_active: boolean;
    created_at: string;
}

// ── Public endpoints ──

export async function getInviteInfo(token: string): Promise<InviteInfo> {
    const res = await fetch(`${API_URL}/invite/${token}`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في جلب بيانات الدعوة");
    }
    return res.json();
}

export async function joinViaToken(
    token: string,
    data: { studentName: string; studentEmail?: string; studentPhone?: string }
): Promise<{ message: string; studentId: string; status: string }> {
    const res = await fetch(`${API_URL}/invite/${token}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في الانضمام");
    }
    return res.json();
}

export async function joinViaCode(
    data: { joinCode: string; studentName: string; studentEmail?: string; studentPhone?: string }
): Promise<{ message: string; teacherName: string; studentId: string; status: string }> {
    const res = await fetch(`${API_URL}/join-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في الانضمام");
    }
    return res.json();
}

// ── Teacher endpoints ──

export async function generateInvite(
    data: { maxUses?: number; expiresInDays?: number } = {}
): Promise<GeneratedInvite> {
    const res = await fetch(`${API_URL}/invite/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في إنشاء الرابط");
    }
    return res.json();
}

export async function getMyInvites(): Promise<{ invites: InviteToken[]; joinCode: string | null }> {
    const res = await fetch(`${API_URL}/my-invites`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("فشل في جلب الروابط");
    return res.json();
}

export async function deactivateInvite(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/invite/${id}/deactivate`, {
        method: "PATCH",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("فشل في تعطيل الرابط");
}

export async function addStudentManually(data: {
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    autoApprove?: boolean;
    expiresInDays?: number;
}): Promise<any> {
    const res = await fetch(`${API_URL}/students/add-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "فشل في إضافة الطالب");
    }
    return res.json();
}
