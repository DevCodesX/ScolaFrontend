import { getAuthHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/classes`;

export interface Class {
    id: string;
    name: string;
    teacher_id: string | null;
    teacher_name?: string;
    institution_id: string;
    created_at?: string;
}

export async function getClasses(): Promise<Class[]> {
    const res = await fetch(API_URL, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch classes");
    }

    return res.json();
}

export async function addClass(data: { name: string; teacher_id?: string }): Promise<Class> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to add class");
    }

    return res.json();
}

export async function updateClass(id: string, data: { name: string; teacher_id?: string }): Promise<Class> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to update class");
    }

    return res.json();
}

export async function deleteClass(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to delete class");
    }
}

export async function getClassStudents(classId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/${classId}/students`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch class students");
    }

    return res.json();
}

export async function addStudentToClass(classId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/${classId}/students`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ studentId }),
    });

    if (!res.ok) {
        throw new Error("Failed to add student to class");
    }
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/${classId}/students/${studentId}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        throw new Error("Failed to remove student from class");
    }
}
