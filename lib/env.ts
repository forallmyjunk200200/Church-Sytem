export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
  return raw.replace(/\/+$/, "");
}
