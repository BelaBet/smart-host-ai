export type OfflineMutation = {
  id: string;
  createdAt: string;
  table: string;
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  filters?: Record<string, string>;
  attempts: number;
  lastError?: string;
};

const STORAGE_KEY = "smart-host-offline-queue-v1";

function readQueue(): OfflineMutation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineMutation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent("smart-host-offline-queue-changed"));
}

export function getOfflineQueue() {
  return readQueue();
}

export function enqueueOfflineMutation(input: Omit<OfflineMutation, "id" | "createdAt" | "attempts">) {
  const item: OfflineMutation = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  writeQueue([...readQueue(), item]);
  return item;
}

export function removeOfflineMutation(id: string) {
  writeQueue(readQueue().filter(item => item.id !== id));
}

export function updateOfflineMutation(id: string, patch: Partial<OfflineMutation>) {
  writeQueue(readQueue().map(item => item.id === id ? { ...item, ...patch } : item));
}

export function clearOfflineQueue() {
  writeQueue([]);
}

export function hasPendingOfflineChanges() {
  return readQueue().length > 0;
}
