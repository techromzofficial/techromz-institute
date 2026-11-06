import { request, ApiError } from "@/lib/api/client";

export { ApiError } from "@/lib/api/client";

export async function apiClient<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request(path, options) as Promise<T>;
}

export type AdminApiError = InstanceType<typeof ApiError>;
