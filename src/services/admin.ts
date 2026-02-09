import { getAuthHeaders } from "./authService";

const API_URL = "http://localhost:4000/api/admin";

export interface DashboardStats {
    teachers: number;
    students: number;
    classes: number;
}

export async function getAdminDashboard(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/dashboard`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized - Please login");
        }
        if (res.status === 403) {
            throw new Error("Forbidden - Admin access required");
        }
        throw new Error("Failed to load dashboard");
    }

    return res.json();
}
