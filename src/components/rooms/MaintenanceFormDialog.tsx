import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, MaintenanceLog } from "@/types/room";
import { toast } from "sonner";

interface MaintenanceFormDialogProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (roomId: string, log: MaintenanceLog) => void;
}

export function MaintenanceFormDialog({
  room,
  open,
  onOpenChange,
  onSubmit,
}: MaintenanceFormDialogProps) {
  const [type, setType] = useState<"cleaning" | "maintenance" | "inspection">("cleaning");
  const [description, setDescription] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room) return;
    if (!description.trim() || !responsiblePerson.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const log: MaintenanceLog = {
      id: `log-${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR"),
      type,
      description,
      responsiblePerson,
      status,
    };

    onSubmit(room.id, log);
    resetForm();
    onOpenChange(false);
    toast.success("Registro adicionado com sucesso!");
  };

  const resetForm = () => {
    setType("cleaning");
    setDescription("");
    setResponsiblePerson("");
    setStatus("pending");
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Novo Registro - Quarto {room.number}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleaning">Limpeza</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inspection">Inspeção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o serviço realizado..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável *</Label>
            <Input
              id="responsible"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Registro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
