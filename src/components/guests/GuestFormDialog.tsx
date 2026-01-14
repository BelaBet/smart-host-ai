import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Guest, GuestStatus } from "@/types/guest";

const guestSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(10, "Telefone inválido").max(20),
  document: z.string().min(11, "Documento inválido").max(20),
  room: z.string().max(10),
  checkIn: z.string().min(1, "Data de check-in obrigatória"),
  checkOut: z.string().min(1, "Data de check-out obrigatória"),
  status: z.enum(["reserved", "checked-in", "checking-out", "checked-out", "pending", "cancelled"]),
  notes: z.string().max(500),
  totalValue: z.number().min(0, "Valor deve ser positivo"),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (guest: Omit<Guest, "id" | "createdAt">) => void;
  guest: Guest | null;
}

// Mock available rooms
const availableRooms = [
  { id: "101", label: "101 - Standard" },
  { id: "102", label: "102 - Standard" },
  { id: "103", label: "103 - Standard" },
  { id: "201", label: "201 - Luxo" },
  { id: "202", label: "202 - Luxo" },
  { id: "203", label: "203 - Luxo" },
  { id: "301", label: "301 - Suíte" },
  { id: "302", label: "302 - Suíte" },
  { id: "303", label: "303 - Suíte Master" },
];

export function GuestFormDialog({
  open,
  onClose,
  onSubmit,
  guest,
}: GuestFormDialogProps) {
  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      document: "",
      room: "",
      checkIn: "",
      checkOut: "",
      status: "reserved",
      notes: "",
      totalValue: 0,
    },
  });

  useEffect(() => {
    if (guest) {
      form.reset({
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        document: guest.document,
        room: guest.room,
        checkIn: guest.checkIn,
        checkOut: guest.checkOut,
        status: guest.status,
        notes: guest.notes,
        totalValue: guest.totalValue,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        document: "",
        room: "",
        checkIn: "",
        checkOut: "",
        status: "reserved",
        notes: "",
        totalValue: 0,
      });
    }
  }, [guest, form]);

  const handleSubmit = (data: GuestFormData) => {
    onSubmit({
      name: data.name,
      email: data.email,
      phone: data.phone,
      document: data.document,
      room: data.room,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status,
      notes: data.notes,
      totalValue: data.totalValue,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {guest ? "Editar Hóspede" : "Novo Hóspede"}
          </DialogTitle>
          <DialogDescription>
            {guest
              ? "Atualize as informações do hóspede."
              : "Preencha os dados para cadastrar um novo hóspede."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@email.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 98765-4321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/Documento</FormLabel>
                    <FormControl>
                      <Input placeholder="123.456.789-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um quarto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum (reserva pendente)</SelectItem>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reserved">Reservado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="checked-in">Hospedado</SelectItem>
                        <SelectItem value="checking-out">Check-out Hoje</SelectItem>
                        <SelectItem value="checked-out">Finalizado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Check-in</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="checkOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Check-out</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Preferências, alergias, solicitações especiais..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="hero">
                {guest ? "Salvar Alterações" : "Cadastrar Hóspede"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
