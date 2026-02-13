import { Teacher } from "../types";
export type { Teacher };
import { getAuthHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/teachers`;

export async function getTeachers(): Promise<Teacher[]> {
    const res = await fetch(API_URL, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized - Please login");
        }
        throw new Error("Failed to fetch teachers");
    }

    const data = await res.json();

    return data.map((t: any) => ({
        ...t,
        subjects: t.subject ? t.subject.split(",").map((s: string) => s.trim()) : [],
    }));
}

export async function addTeacher(data: any): Promise<Teacher> {
    const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subjects ? data.subjects.join(",") : "",
    };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized - Please login");
        }
        throw new Error("Failed to add teacher");
    }

    const teacher = await res.json();

    return {
        ...teacher,
        subjects: teacher.subject ? teacher.subject.split(",").map((s: string) => s.trim()) : [],
    };
}

export async function updateTeacher(id: string, data: any): Promise<Teacher> {
    const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subjects ? data.subjects.join(",") : "",
    };

    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized - Please login");
        }
        throw new Error("Failed to update teacher");
    }

    const teacher = await res.json();

    return {
        ...teacher,
        subjects: teacher.subject ? teacher.subject.split(",").map((s: string) => s.trim()) : [],
    };
}

export async function deleteTeacher(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized - Please login");
        }
        throw new Error("Failed to delete teacher");
    }
}
