import type {
  FieldTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiResponse,
  SyncPushRequest,
  SyncPullResponse,
} from "@repo/shared/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiFetch<T>(
  path: string,
  idToken: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `API error ${res.status}`), {
      status: res.status,
    });
  }

  return res.json() as Promise<T>;
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function getTasks(idToken: string): Promise<FieldTask[]> {
  const res = await apiFetch<ApiResponse<FieldTask[]>>("/v1/tasks", idToken);
  return res.data;
}

export async function getTask(id: string, idToken: string): Promise<FieldTask> {
  const res = await apiFetch<ApiResponse<FieldTask>>(`/v1/tasks/${id}`, idToken);
  return res.data;
}

export async function createTask(
  req: CreateTaskRequest,
  idToken: string
): Promise<FieldTask> {
  const res = await apiFetch<ApiResponse<FieldTask>>("/v1/tasks", idToken, {
    method: "POST",
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function updateTask(
  id: string,
  req: UpdateTaskRequest,
  idToken: string
): Promise<FieldTask> {
  const res = await apiFetch<ApiResponse<FieldTask>>(
    `/v1/tasks/${id}`,
    idToken,
    {
      method: "PATCH",
      body: JSON.stringify(req),
    }
  );
  return res.data;
}

export async function deleteTask(
  id: string,
  idToken: string
): Promise<void> {
  await apiFetch<void>(`/v1/tasks/${id}`, idToken, { method: "DELETE" });
}

// ── Sync ──────────────────────────────────────────────────────────────────────

export async function syncPush(
  req: SyncPushRequest,
  idToken: string
): Promise<void> {
  await apiFetch<void>("/v1/sync/push", idToken, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function syncPull(
  since: number,
  idToken: string
): Promise<SyncPullResponse> {
  return apiFetch<SyncPullResponse>(
    `/v1/sync/pull?since=${since}`,
    idToken
  );
}
