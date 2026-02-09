const API = "http://localhost:4000/api/timetable";

export interface TimetableSlot {
    id: string;
    class_id: string;
    teacher_id: string;
    day: 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu';
    start_time: string;
    end_time: string;
    class_name: string;
    teacher_name?: string;
}

export async function getTeacherTimetable(): Promise<TimetableSlot[]> {
    const res = await fetch(`${API}/teacher`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch timetable");
    return res.json();
}

export async function getClassTimetable(classId: string): Promise<TimetableSlot[]> {
    const res = await fetch(`${API}/class/${classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch timetable");
    return res.json();
}

export async function getAllSlots(): Promise<TimetableSlot[]> {
    const res = await fetch(`${API}/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch timetable");
    return res.json();
}

export async function addSlot(data: {
    class_id: string;
    teacher_id: string;
    day: string;
    start_time: string;
    end_time: string;
}): Promise<void> {
    const res = await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add slot");
}

export async function deleteSlot(id: string): Promise<void> {
    const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to delete slot");
}
