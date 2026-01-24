-- Create room types enum
CREATE TYPE public.room_type AS ENUM ('standard', 'superior', 'deluxe', 'suite', 'presidential');

-- Create room status enum
CREATE TYPE public.room_status AS ENUM ('available', 'occupied', 'maintenance', 'cleaning', 'reserved');

-- Create reservation status enum
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  type room_type NOT NULL DEFAULT 'standard',
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 2,
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  status room_status NOT NULL DEFAULT 'available',
  amenities TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guests table
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'cpf',
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  notes TEXT,
  total_stays INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  confirmation_code TEXT NOT NULL UNIQUE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  total_value DECIMAL(10,2) NOT NULL,
  status reservation_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  special_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room maintenance history table
CREATE TABLE public.room_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables (public access for now, can be restricted later)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_maintenance ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (hotel staff - can be restricted with auth later)
CREATE POLICY "Allow public read access on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on rooms" ON public.rooms FOR DELETE USING (true);

CREATE POLICY "Allow public read access on guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on guests" ON public.guests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on guests" ON public.guests FOR DELETE USING (true);

CREATE POLICY "Allow public read access on reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on reservations" ON public.reservations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on reservations" ON public.reservations FOR DELETE USING (true);

CREATE POLICY "Allow public read access on room_maintenance" ON public.room_maintenance FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on room_maintenance" ON public.room_maintenance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on room_maintenance" ON public.room_maintenance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on room_maintenance" ON public.room_maintenance FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate confirmation code
CREATE OR REPLACE FUNCTION public.generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL THEN
    NEW.confirmation_code := 'RES-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_reservation_code
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_confirmation_code();

-- Insert sample rooms
INSERT INTO public.rooms (number, type, floor, capacity, price_per_night, status, amenities) VALUES
('101', 'standard', 1, 2, 180.00, 'available', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar']),
('102', 'standard', 1, 2, 180.00, 'occupied', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar']),
('103', 'superior', 1, 3, 280.00, 'available', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar', 'cofre', 'varanda']),
('201', 'deluxe', 2, 2, 380.00, 'available', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar', 'cofre', 'varanda', 'banheira']),
('202', 'deluxe', 2, 2, 380.00, 'maintenance', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar', 'cofre', 'varanda', 'banheira']),
('203', 'suite', 2, 4, 550.00, 'available', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar', 'cofre', 'varanda', 'banheira', 'sala_estar']),
('301', 'presidential', 3, 4, 1200.00, 'available', ARRAY['wifi', 'tv', 'ar_condicionado', 'frigobar', 'cofre', 'varanda', 'banheira', 'sala_estar', 'cozinha', 'jacuzzi']);

-- Insert sample guests
INSERT INTO public.guests (name, email, phone, document, document_type, city, state) VALUES
('João Silva', 'joao.silva@email.com', '(11) 99999-1234', '123.456.789-00', 'cpf', 'São Paulo', 'SP'),
('Maria Santos', 'maria.santos@email.com', '(21) 98888-5678', '987.654.321-00', 'cpf', 'Rio de Janeiro', 'RJ'),
('Carlos Oliveira', 'carlos.o@email.com', '(31) 97777-4321', '456.789.123-00', 'cpf', 'Belo Horizonte', 'MG');