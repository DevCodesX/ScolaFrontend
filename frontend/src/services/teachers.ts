import { Teacher } from "../types";
export type { Teacher };
import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/teachers");

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
        throw new Error(`Failed to fetch teachers [${res.status} ${res.statusText}]`);
    }

    const data = await res.json();

    return data.map((t: any) => ({
        ...t,
        subjects: t.subject ? t.subject.split(",").map((s: string) => s.trim()) : [],
    }));
}

export async function addTeacher(data: any): Promise<Teacher> {
    // Backend expects first_name + last_name, frontend sends single "name"
    const nameParts = (data.name || "").trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const payload = {
        first_name,
        last_name,
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
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed to add teacher [${res.status} ${res.statusText}]`);
    }

    const teacher = await res.json();

    return {
        ...teacher,
        subjects: teacher.subject ? teacher.subject.split(",").map((s: string) => s.trim()) : [],
    };
}

export async function updateTeacher(id: string, data: any): Promise<Teacher> {
    const nameParts = (data.name || "").trim().split(/\s+/);
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const payload = {
        first_name,
        last_name,
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
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed to update teacher [${res.status} ${res.statusText}]`);
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
        throw new Error(`Failed to delete teacher [${res.status} ${res.statusText}]`);
    }
}
