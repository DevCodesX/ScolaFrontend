import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/classes");

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

    if (!res.ok) throw new Error(`Failed to fetch classes [${res.status} ${res.statusText}]`);

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

    if (!res.ok) throw new Error(`Failed to add class [${res.status} ${res.statusText}]`);

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

    if (!res.ok) throw new Error(`Failed to update class [${res.status} ${res.statusText}]`);

    return res.json();
}

export async function deleteClass(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) throw new Error(`Failed to delete class [${res.status} ${res.statusText}]`);
}

export async function getClassStudents(classId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/${classId}/students`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) throw new Error(`Failed to fetch class students [${res.status} ${res.statusText}]`);

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

    if (!res.ok) throw new Error(`Failed to add student to class [${res.status} ${res.statusText}]`);
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/${classId}/students/${studentId}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) throw new Error(`Failed to remove student from class [${res.status} ${res.statusText}]`);
}
