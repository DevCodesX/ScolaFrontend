import { getAuthHeaders } from "./authService";
import { apiUrl } from "../lib/api";

const API_URL = apiUrl("/api/grades");

export interface Grade {
    id: string;
    student_id: string;
    student_name: string;
    grade_type: string;
    score: number;
    max_score: number;
    created_at?: string;
}

export interface GradeSummary {
    id: string;
    name: string;
    total_grades: number;
    average_percentage: number | null;
}

export async function getClassGrades(classId: string): Promise<Grade[]> {
    const res = await fetch(`${API_URL}/class/${classId}`, {
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error(`Failed to fetch grades [${res.status} ${res.statusText}]`);
    return res.json();
}

export async function addGrade(data: {
    student_id: string;
    class_id: string;
    grade_type: string;
    score: number;
    max_score: number;
}): Promise<Grade> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Failed to add grade [${res.status} ${res.statusText}]`);
    return res.json();
}

export async function addBulkGrades(
    classId: string,
    gradeType: string,
    maxScore: number,
    records: { student_id: string; score: number }[]
): Promise<void> {
    const res = await fetch(`${API_URL}/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            class_id: classId,
            grade_type: gradeType,
            max_score: maxScore,
            records,
        }),
    });

    if (!res.ok) throw new Error(`Failed to save grades [${res.status} ${res.statusText}]`);
}

export async function getGradesSummary(classId: string): Promise<GradeSummary[]> {
    const res = await fetch(`${API_URL}/class/${classId}/summary`, {
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error(`Failed to fetch summary [${res.status} ${res.statusText}]`);
    return res.json();
}

export async function deleteGrade(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error(`Failed to delete grade [${res.status} ${res.statusText}]`);
}
