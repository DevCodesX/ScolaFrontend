import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/teacher");

export interface DashboardStats {
    classes: number;
    students: number;
    teacher: {
        id: string;
        firstName: string;
        lastName: string;
        subject: string;
        qualification: string;
        teacherType: 'free' | 'institution';
    };
}

export interface TeacherClass {
    id: string;
    name: string;
    teacher_id: string;
    institution_id: string | null;
    created_at?: string;
}

export interface TeacherStudent {
    id: string;
    name: string;
    email: string;
    phone: string;
    owner_teacher_id?: string;
}

// ─── Dashboard ──────────────────────────────────────────────
export async function getTeacherDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/dashboard`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch dashboard [${res.status}]`);
    return res.json();
}

// ─── Classes (Read — all teachers) ──────────────────────────
export async function getTeacherClasses(): Promise<TeacherClass[]> {
    const res = await fetch(`${API_URL}/classes`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch classes [${res.status}]`);
    return res.json();
}

// ─── Students in classes (Read — all teachers) ──────────────
export async function getTeacherStudents(): Promise<TeacherStudent[]> {
    const res = await fetch(`${API_URL}/students`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch students [${res.status}]`);
    return res.json();
}

export async function getTeacherClassStudents(classId: string): Promise<TeacherStudent[]> {
    const res = await fetch(`${API_URL}/classes/${classId}/students`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch class students [${res.status}]`);
    return res.json();
}

// ═══════════════════════════════════════════════════════════════
//  FREE TEACHER — STUDENT CRUD
// ═══════════════════════════════════════════════════════════════

export async function getAllMyStudents(): Promise<TeacherStudent[]> {
    const res = await fetch(`${API_URL}/students/all`, {
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error(`Failed to fetch students [${res.status}]`);
    return res.json();
}

export async function createMyStudent(data: { name: string; email?: string; phone?: string }): Promise<TeacherStudent> {
    const res = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create student");
    }
    return res.json();
}

export async function updateMyStudent(id: string, data: { name: string; email?: string; phone?: string }): Promise<TeacherStudent> {
    const res = await fetch(`${API_URL}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update student");
    }
    return res.json();
}

export async function deleteMyStudent(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete student");
}

// ═══════════════════════════════════════════════════════════════
//  FREE TEACHER — CLASS CRUD
// ═══════════════════════════════════════════════════════════════

export async function createMyClass(data: { name: string }): Promise<TeacherClass> {
    const res = await fetch(`${API_URL}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create class");
    }
    return res.json();
}

export async function updateMyClass(id: string, data: { name: string }): Promise<TeacherClass> {
    const res = await fetch(`${API_URL}/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update class");
    }
    return res.json();
}

export async function deleteMyClass(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/classes/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete class");
}

// ═══════════════════════════════════════════════════════════════
//  FREE TEACHER — STUDENT ↔ CLASS ASSIGNMENT
// ═══════════════════════════════════════════════════════════════

export async function addStudentToMyClass(classId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ studentId }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add student to class");
    }
}

export async function removeStudentFromMyClass(classId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/classes/${classId}/students/${studentId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to remove student from class");
}
