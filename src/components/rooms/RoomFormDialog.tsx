import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Room, RoomType, roomTypeConfig } from "@/types/room";
import { toast } from "sonner";

interface RoomFormDialogProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (room: Partial<Room>) => void;
}

const availableAmenities = [
  "Wi-Fi",
  "TV",
  "Ar-condicionado",
  "Frigobar",
  "Cofre",
  "Banheira",
  "Varanda",
  "Vista Mar",
];

export function RoomFormDialog({
  room,
  open,
  onOpenChange,
  onSubmit,
}: RoomFormDialogProps) {
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState(1);
  const [type, setType] = useState<RoomType>("standard");
  const [capacity, setCapacity] = useState(2);
  const [pricePerNight, setPricePerNight] = useState(150);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (room) {
      setNumber(room.number);
      setFloor(room.floor);
      setType(room.type);
      setCapacity(room.capacity);
      setPricePerNight(room.pricePerNight);
      setAmenities(room.amenities);
      setNotes(room.notes || "");
    } else {
      resetForm();
    }
  }, [room]);

  const resetForm = () => {
    setNumber("");
    setFloor(1);
    setType("standard");
    setCapacity(2);
    setPricePerNight(150);
    setAmenities([]);
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number.trim()) {
      toast.error("Informe o número do quarto");
      return;
    }

    onSubmit({
      id: room?.id,
      number,
      floor,
      type,
      capacity,
      pricePerNight,
      amenities,
      notes,
      status: room?.status || "available",
    });

    onOpenChange(false);
    toast.success(room ? "Quarto atualizado!" : "Quarto cadastrado!");
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {room ? "Editar Quarto" : "Novo Quarto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Ex: 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Andar *</Label>
              <Input
                id="floor"
                type="number"
                min={1}
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as RoomType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roomTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={10}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço por Noite (R$)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label>Comodidades</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {room ? "Salvar Alterações" : "Cadastrar Quarto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
