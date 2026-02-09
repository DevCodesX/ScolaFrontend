import { supabase } from "./supabase";

export async function getTeachers(institutionId: string) {
    const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching teachers:", error);
        throw error;
    }

    return data;
}
