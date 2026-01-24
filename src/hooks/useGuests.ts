import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DbGuest = Tables<"guests">;
export type GuestInsert = TablesInsert<"guests">;
export type GuestUpdate = TablesUpdate<"guests">;

// Fetch all guests
export function useGuests() {
  return useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as DbGuest[];
    },
  });
}

// Fetch single guest
export function useGuest(id: string | undefined) {
  return useQuery({
    queryKey: ["guests", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as DbGuest | null;
    },
    enabled: !!id,
  });
}

// Search guests by name or email
export function useSearchGuests(searchTerm: string) {
  return useQuery({
    queryKey: ["guests", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,document.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data as DbGuest[];
    },
    enabled: searchTerm.length >= 2,
  });
}

// Create guest
export function useCreateGuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guest: GuestInsert) => {
      const { data, error } = await supabase
        .from("guests")
        .insert(guest)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success("Hóspede cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar hóspede: ${error.message}`);
    },
  });
}

// Update guest
export function useUpdateGuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...guest }: GuestUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("guests")
        .update(guest)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success("Hóspede atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar hóspede: ${error.message}`);
    },
  });
}

// Delete guest
export function useDeleteGuest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("guests")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
      toast.success("Hóspede excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir hóspede: ${error.message}`);
    },
  });
}

// Update guest stats after reservation
export function useUpdateGuestStats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, addStays, addSpent }: { id: string; addStays?: number; addSpent?: number }) => {
      // First get current values
      const { data: current, error: fetchError } = await supabase
        .from("guests")
        .select("total_stays, total_spent")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from("guests")
        .update({
          total_stays: (current.total_stays || 0) + (addStays || 0),
          total_spent: (current.total_spent || 0) + (addSpent || 0),
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
  });
}
