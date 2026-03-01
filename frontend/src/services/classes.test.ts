import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

describe("classes service", () => {
  const originalFetch = global.fetch;
  const originalLocalStorage = (global as any).localStorage;

  beforeAll(() => {
    (global as any).localStorage = {
      store: {} as Record<string, string>,
      getItem(key: string) { return this.store[key] ?? null; },
      setItem(key: string, val: string) { this.store[key] = val; },
      removeItem(key: string) { delete this.store[key]; },
      clear() { this.store = {}; }
    };
  });

  afterAll(() => {
    global.fetch = originalFetch as any;
    (global as any).localStorage = originalLocalStorage;
  });

  it("targets relative /api in dev when env missing", async () => {
    const prev = (global as any).process?.env?.VITE_API_URL;
    (global as any).process = (global as any).process || { env: {} };
    delete (global as any).process.env.VITE_API_URL;
    const { getClasses } = await import("./classes");
    const mock = vi.fn(async () => ({
      ok: true,
      json: async () => ([]),
      status: 200,
      statusText: "OK"
    } as any));
    global.fetch = mock as any;
    await getClasses();
    expect(mock).toHaveBeenCalled();
    const url = mock.mock.calls[0][0] as string;
    expect(url).toBe("/api/classes");
    if (prev !== undefined) (global as any).process.env.VITE_API_URL = prev;
  });

  it("throws detailed error on non-ok response", async () => {
    const { getClasses } = await import("./classes");
    const mock = vi.fn(async () => ({
      ok: false,
      json: async () => ([]),
      status: 503,
      statusText: "Service Unavailable"
    } as any));
    global.fetch = mock as any;
    await expect(getClasses()).rejects.toThrow("Failed to fetch classes [503 Service Unavailable]");
  });
});
