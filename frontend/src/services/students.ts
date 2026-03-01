import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/students");

export interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    institution_id: string;
    created_at?: string;
}

export async function getStudents(): Promise<Student[]> {
    const res = await fetch(API_URL, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) throw new Error(`Failed to fetch students [${res.status} ${res.statusText}]`);

    return res.json();
}

export async function addStudent(data: Omit<Student, "id" | "institution_id" | "created_at">): Promise<Student> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Failed to add student [${res.status} ${res.statusText}]`);

    return res.json();
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Failed to update student [${res.status} ${res.statusText}]`);

    return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) throw new Error(`Failed to delete student [${res.status} ${res.statusText}]`);
}
