import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:4000/api/grades";

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

    if (!res.ok) throw new Error("Failed to fetch grades");
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

    if (!res.ok) throw new Error("Failed to add grade");
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

    if (!res.ok) throw new Error("Failed to save grades");
}

export async function getGradesSummary(classId: string): Promise<GradeSummary[]> {
    const res = await fetch(`${API_URL}/class/${classId}/summary`, {
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error("Failed to fetch summary");
    return res.json();
}

export async function deleteGrade(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error("Failed to delete grade");
}
