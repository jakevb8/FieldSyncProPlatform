"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api-client";
import type { FieldTask, CreateTaskRequest, UpdateTaskRequest } from "@repo/shared/types";
import { sortTasks } from "@repo/shared/utils";

interface UseTasksResult {
  tasks: FieldTask[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (req: CreateTaskRequest) => Promise<FieldTask>;
  update: (id: string, req: UpdateTaskRequest) => Promise<FieldTask>;
  remove: (id: string) => Promise<void>;
}

export function useTasks(): UseTasksResult {
  const { idToken } = useAuth();
  const [tasks, setTasks] = useState<FieldTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const fetched = await getTasks(idToken);
      setTasks(sortTasks(fetched));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    if (idToken) {
      refresh();
    }
  }, [idToken, refresh]);

  const create = useCallback(
    async (req: CreateTaskRequest): Promise<FieldTask> => {
      if (!idToken) throw new Error("Not authenticated");
      const task = await createTask(req, idToken);
      setTasks((prev) => sortTasks([...prev, task]));
      return task;
    },
    [idToken]
  );

  const update = useCallback(
    async (id: string, req: UpdateTaskRequest): Promise<FieldTask> => {
      if (!idToken) throw new Error("Not authenticated");
      const updated = await updateTask(id, req, idToken);
      setTasks((prev) =>
        sortTasks(prev.map((t) => (t.id === id ? updated : t)))
      );
      return updated;
    },
    [idToken]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (!idToken) throw new Error("Not authenticated");
      await deleteTask(id, idToken);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [idToken]
  );

  return { tasks, loading, error, refresh, create, update, remove };
}
