import { Teacher } from "../types";

const API_URL = `${import.meta.env.VITE_API_URL}/api/teachers`;

export interface TeacherPayload {
    name: string;
    email: string;
    phone: string;
    subject: string;
    institution_id: string;
}

export async function fetchTeachers(institutionId: string): Promise<Teacher[]> {
    const res = await fetch(`${API_URL}/${institutionId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch teachers");
    }

    const data = await res.json();

    return data.map((teacher: any) => ({
        ...teacher,
        subjects: teacher.subject
            ? teacher.subject.split(",").map((s: string) => s.trim())
            : [],
    }));
}

export async function createTeacher(data: any): Promise<Teacher> {
    const payload = {
        ...data,
        subject: data.subjects ? data.subjects.join(",") : (data.subject || ""),
    };

    delete payload.subjects;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to add teacher");
    }

    const teacher = await res.json();

    return {
        ...teacher,
        subjects: teacher.subject ? teacher.subject.split(",").map((s: string) => s.trim()) : [],
    };
}

export async function updateTeacher(id: string, data: Partial<TeacherPayload>): Promise<Teacher> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
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
    });

    if (!res.ok) {
        throw new Error("Failed to delete teacher");
    }
}
