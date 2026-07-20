const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:9000";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`FarmNomad API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
