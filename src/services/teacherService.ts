import { getAuthHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/teacher`;

export interface DashboardStats {
    classes: number;
    students: number;
}

export interface TeacherClass {
    id: string;
    name: string;
    teacher_id: string;
    institution_id: string;
    created_at?: string;
}

export interface TeacherStudent {
    id: string;
    name: string;
    email: string;
    phone: string;
}

export async function getTeacherDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/dashboard`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch dashboard");
    }

    return res.json();
}

export async function getTeacherClasses(): Promise<TeacherClass[]> {
    const res = await fetch(`${API_URL}/classes`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch classes");
    }

    return res.json();
}

export async function getTeacherStudents(): Promise<TeacherStudent[]> {
    const res = await fetch(`${API_URL}/students`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch students");
    }

    return res.json();
}

export async function getTeacherClassStudents(classId: string): Promise<TeacherStudent[]> {
    const res = await fetch(`${API_URL}/classes/${classId}/students`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch class students");
    }

    return res.json();
}
