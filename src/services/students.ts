import { getAuthHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/students`;

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

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch students");
    }

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

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to add student");
    }

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

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to update student");
    }

    return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to delete student");
    }
}
