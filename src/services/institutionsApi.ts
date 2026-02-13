import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/institutions`;

export interface Institution {
    id: string;
    name: string;
    created_at?: string;
}

export async function fetchInstitutions(): Promise<Institution[]> {
    const res = await axios.get(API_URL);
    return res.data;
}

export async function createInstitution(name: string): Promise<Institution> {
    const res = await axios.post(API_URL, { name });
    return res.data;
}

export async function deleteInstitution(id: string): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
}
