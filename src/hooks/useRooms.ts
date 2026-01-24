import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type DbRoomType = Enums<"room_type">;
export type DbRoomStatus = Enums<"room_status">;
export type DbRoom = Tables<"rooms">;
export type RoomInsert = TablesInsert<"rooms">;
export type RoomUpdate = TablesUpdate<"rooms">;
export type RoomMaintenance = Tables<"room_maintenance">;
export type MaintenanceInsert = TablesInsert<"room_maintenance">;

// Fetch all rooms
export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("number");
      
      if (error) throw error;
      return data as DbRoom[];
    },
  });
}

// Fetch single room
export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as DbRoom | null;
    },
    enabled: !!id,
  });
}

// Fetch room maintenance logs
export function useRoomMaintenance(roomId: string | undefined) {
  return useQuery({
    queryKey: ["room_maintenance", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data, error } = await supabase
        .from("room_maintenance")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as RoomMaintenance[];
    },
    enabled: !!roomId,
  });
}

// Create room
export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (room: RoomInsert) => {
      const { data, error } = await supabase
        .from("rooms")
        .insert(room)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Quarto criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar quarto: ${error.message}`);
    },
  });
}

// Update room
export function useUpdateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...room }: RoomUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("rooms")
        .update(room)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Quarto atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar quarto: ${error.message}`);
    },
  });
}

// Update room status
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DbRoomStatus }) => {
      const { data, error } = await supabase
        .from("rooms")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });
}

// Delete room
export function useDeleteRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Quarto excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir quarto: ${error.message}`);
    },
  });
}

// Create maintenance log
export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (maintenance: MaintenanceInsert) => {
      const { data, error } = await supabase
        .from("room_maintenance")
        .insert(maintenance)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["room_maintenance", variables.room_id] });
      toast.success("Registro de manutenção criado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar registro: ${error.message}`);
    },
  });
}
