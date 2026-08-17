import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineQueue, removeOfflineMutation, updateOfflineMutation } from "@/lib/offlineQueue";
import { toast } from "sonner";

export function useOfflineSync() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [pending, setPending] = useState(() => getOfflineQueue().length);

  const sync = async () => {
    if (!navigator.onLine) return;
    const queue = getOfflineQueue();
    for (const item of queue) {
      try {
        let error;
        if (item.operation === "insert") {
          ({ error } = await supabase.from(item.table).insert(item.payload));
        } else if (item.operation === "update") {
          let query = supabase.from(item.table).update(item.payload);
          Object.entries(item.filters ?? {}).forEach(([key, value]) => { query = query.eq(key, value); });
          ({ error } = await query);
        } else {
          let query = supabase.from(item.table).delete();
          Object.entries(item.filters ?? {}).forEach(([key, value]) => { query = query.eq(key, value); });
          ({ error } = await query);
        }
        if (error) throw error;
        removeOfflineMutation(item.id);
      } catch (error) {
        updateOfflineMutation(item.id, { attempts: item.attempts + 1, lastError: error instanceof Error ? error.message : "Falha de sincronização" });
      }
    }
    setPending(getOfflineQueue().length);
  };

  useEffect(() => {
    const onOnline = () => { setOnline(true); void sync(); };
    const onOffline = () => setOnline(false);
    const onQueueChanged = () => setPending(getOfflineQueue().length);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("smart-host-offline-queue-changed", onQueueChanged);
    const timer = window.setInterval(() => void sync(), 15000);
    void sync();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("smart-host-offline-queue-changed", onQueueChanged);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (online && pending > 0) toast.info(`${pending} alteração(ões) aguardando sincronização.`);
  }, [online]);

  return { online, pending, sync };
}
