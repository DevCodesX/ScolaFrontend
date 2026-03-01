import { describe, it, expect } from "vitest";
import { getApiBase, apiUrl } from "./api";

describe("api utilities", () => {
  it("returns empty base when env missing", () => {
    const prev = (global as any).process?.env?.VITE_API_URL;
    (global as any).process = (global as any).process || { env: {} };
    delete (global as any).process.env.VITE_API_URL;
    expect(getApiBase()).toBe("");
    if (prev !== undefined) (global as any).process.env.VITE_API_URL = prev;
  });

  it("builds api url with empty base", () => {
    const prev = (global as any).process?.env?.VITE_API_URL;
    (global as any).process = (global as any).process || { env: {} };
    delete (global as any).process.env.VITE_API_URL;
    expect(apiUrl("/api/teachers")).toBe("/api/teachers");
    if (prev !== undefined) (global as any).process.env.VITE_API_URL = prev;
  });

  it("trims trailing slashes", () => {
    const prev = (global as any).process?.env?.VITE_API_URL;
    (global as any).process = (global as any).process || { env: {} };
    (global as any).process.env.VITE_API_URL = "http://localhost:4000///";
    expect(getApiBase()).toBe("http://localhost:4000");
    (global as any).process.env.VITE_API_URL = prev;
  });
});
