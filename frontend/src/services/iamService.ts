import { apiUrl } from "../lib/api";
import { getAuthHeaders } from "./authService";

const IAM_URL = apiUrl("/api/iam");

// ─── Teacher Registration ───────────────────────────────────
export interface TeacherRegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    qualifications?: string;
    subject: string;
}

export async function registerTeacher(data: TeacherRegisterData) {
    const res = await fetch(`${IAM_URL}/teacher/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message_ar || result.message || "Registration failed");
    return result;
}

// ─── Institution Registration ───────────────────────────────
export interface InstitutionRegisterData {
    institution_name: string;
    admin_name: string;
    admin_email: string;
    admin_password: string;
}

export async function registerInstitution(data: InstitutionRegisterData) {
    const res = await fetch(`${IAM_URL}/institution/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message_ar || result.message || "Registration failed");
    return result;
}

// ─── Email Verification ─────────────────────────────────────
export async function verifyEmail(token: string) {
    const res = await fetch(`${IAM_URL}/verify-email?token=${token}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message_ar || result.message || "Verification failed");
    return result;
}

// ─── Institution Dashboard ──────────────────────────────────
export interface DashboardStats {
    teacherCount: number;
    studentCount: number;
    classCount: number;
    teachers: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        subject: string;
    }>;
    recentStudents: Array<{
        id: string;
        name: string;
        email: string;
    }>;
}

export async function getInstitutionDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${IAM_URL}/institution/dashboard`, {
        headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch dashboard");
    }
    return res.json();
}

// ─── Export Report ──────────────────────────────────────────
export async function exportReport(format: "excel" | "pdf") {
    const res = await fetch(`${IAM_URL}/institution/export?format=${format}`, {
        headers: getAuthHeaders() as HeadersInit,
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = format === "excel" ? "scola-report.xlsx" : "scola-report.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
