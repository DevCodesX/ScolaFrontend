export function getApiBase(): string {
    const fromImport = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
    const fromProcess = typeof process !== "undefined" ? (process as any)?.env?.VITE_API_URL as string | undefined : undefined;
    const v = fromImport || fromProcess;
    if (!v) return "";
    return v.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
    const base = getApiBase();
    return `${base}${path}`;
}
