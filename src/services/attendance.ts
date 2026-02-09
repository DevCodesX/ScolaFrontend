const API = "http://localhost:4000/api/attendance";

export async function getClassAttendance(classId: string, date?: string) {
    const q = date ? `?date=${date}` : "";
    const res = await fetch(`${API}/class/${classId}${q}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json();
}

export async function markAttendance(payload: {
    student_id: string;
    class_id: string;
    date: string;
    status: "present" | "absent" | "late";
}) {
    const res = await fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save attendance");
}
