import { getAuthHeaders } from './authService';

const API_URL = `${import.meta.env.VITE_API_URL}/api/courses`;

export interface Course {
    id: string;
    title: string;
    description: string;
    teacher_id: string;
    teacher_name?: string;
    price: number;
    max_students: number;
    type: string;
    created_at: string;
}

export async function getCourses(): Promise<Course[]> {
    const res = await fetch(API_URL, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch courses");
    return res.json();
}

export async function getCourseById(id: string): Promise<Course> {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to fetch course");
    return res.json();
}

export async function createCourse(data: {
    title: string;
    description: string;
    price: number;
    max_students: number;
    type: string;
}): Promise<{ message: string; courseId: string }> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create course");
    }
    return res.json();
}

export async function updateCourse(id: string, data: {
    title: string;
    description: string;
    price: number;
    max_students: number;
    type: string;
}): Promise<Course> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update course");
    }
    return res.json();
}

export async function deleteCourse(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });
    if (!res.ok) throw new Error("Failed to delete course");
}
