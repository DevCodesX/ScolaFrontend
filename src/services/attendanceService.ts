import { getAuthHeaders } from "./authService";

const API_URL = `${import.meta.env.VITE_API_URL}/api/attendance`;

export interface AttendanceRecord {
    student_id: string;
    name: string;
    status: 'present' | 'absent' | 'late';
}

export interface AttendanceResponse {
    date: string;
    students: AttendanceRecord[];
}

export interface AttendanceSummary {
    id: string;
    name: string;
    present_count: number;
    absent_count: number;
    late_count: number;
}

export async function getClassAttendance(classId: string, date?: string): Promise<AttendanceResponse> {
    const url = date
        ? `${API_URL}/class/${classId}?date=${date}`
        : `${API_URL}/class/${classId}`;

    const res = await fetch(url, {
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json();
}

export async function markAttendance(
    studentId: string,
    classId: string,
    date: string,
    status: 'present' | 'absent' | 'late'
): Promise<void> {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            student_id: studentId,
            class_id: classId,
            date,
            status
        }),
    });

    if (!res.ok) throw new Error("Failed to mark attendance");
}

export async function markBulkAttendance(
    classId: string,
    date: string,
    records: { student_id: string; status: string }[]
): Promise<void> {
    const res = await fetch(`${API_URL}/bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ class_id: classId, date, records }),
    });

    if (!res.ok) throw new Error("Failed to save attendance");
}

export async function getAttendanceSummary(classId: string): Promise<AttendanceSummary[]> {
    const res = await fetch(`${API_URL}/class/${classId}/summary`, {
        headers: { ...getAuthHeaders() },
    });

    if (!res.ok) throw new Error("Failed to fetch summary");
    return res.json();
}
