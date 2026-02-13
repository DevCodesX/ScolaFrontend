const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
        institution_id: string;
    };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
    }

    const data = await res.json();

    // Store token and user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

export function logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function getUser(): LoginResponse["user"] | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

// Helper to get auth headers for API calls
export function getAuthHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}
