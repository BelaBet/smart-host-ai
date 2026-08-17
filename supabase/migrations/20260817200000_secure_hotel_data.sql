-- Security hardening: hotel operational data must require an authenticated session.
-- The previous migration exposed full CRUD access through the anon role.

DROP POLICY IF EXISTS "Allow public read access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public insert access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public update access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public delete access on rooms" ON public.rooms;

DROP POLICY IF EXISTS "Allow public read access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public insert access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public update access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public delete access on guests" ON public.guests;

DROP POLICY IF EXISTS "Allow public read access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public update access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete access on reservations" ON public.reservations;

DROP POLICY IF EXISTS "Allow public read access on room_maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Allow public insert access on room_maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Allow public update access on room_maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Allow public delete access on room_maintenance" ON public.room_maintenance;

CREATE POLICY "Authenticated users can read rooms" ON public.rooms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert rooms" ON public.rooms
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rooms" ON public.rooms
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete rooms" ON public.rooms
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read guests" ON public.guests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert guests" ON public.guests
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update guests" ON public.guests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete guests" ON public.guests
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read reservations" ON public.reservations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reservations" ON public.reservations
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update reservations" ON public.reservations
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete reservations" ON public.reservations
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read room maintenance" ON public.room_maintenance
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert room maintenance" ON public.room_maintenance
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update room maintenance" ON public.room_maintenance
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete room maintenance" ON public.room_maintenance
  FOR DELETE TO authenticated USING (true);

-- Keep room status synchronized when reservation lifecycle changes.
CREATE OR REPLACE FUNCTION public.sync_room_status_from_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.rooms
    SET status = CASE
      WHEN EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.room_id = OLD.room_id
          AND r.status = 'checked_in'
          AND r.check_out >= CURRENT_DATE
      ) THEN 'occupied'::public.room_status
      WHEN EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.room_id = OLD.room_id
          AND r.status IN ('pending','confirmed')
          AND r.check_out >= CURRENT_DATE
      ) THEN 'reserved'::public.room_status
      ELSE 'available'::public.room_status
    END
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;

  UPDATE public.rooms
  SET status = CASE
    WHEN EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.room_id = NEW.room_id
        AND r.status = 'checked_in'
        AND r.check_out >= CURRENT_DATE
    ) THEN 'occupied'::public.room_status
    WHEN EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.room_id = NEW.room_id
        AND r.status IN ('pending','confirmed')
        AND r.check_out >= CURRENT_DATE
    ) THEN 'reserved'::public.room_status
    ELSE 'available'::public.room_status
  END
  WHERE id = NEW.room_id;

  IF TG_OP = 'UPDATE' AND OLD.room_id <> NEW.room_id THEN
    UPDATE public.rooms
    SET status = CASE
      WHEN EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.room_id = OLD.room_id
          AND r.status = 'checked_in'
          AND r.check_out >= CURRENT_DATE
      ) THEN 'occupied'::public.room_status
      WHEN EXISTS (
        SELECT 1 FROM public.reservations r
        WHERE r.room_id = OLD.room_id
          AND r.status IN ('pending','confirmed')
          AND r.check_out >= CURRENT_DATE
      ) THEN 'reserved'::public.room_status
      ELSE 'available'::public.room_status
    END
    WHERE id = OLD.room_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS sync_room_status_after_reservation ON public.reservations;
CREATE TRIGGER sync_room_status_after_reservation
AFTER INSERT OR UPDATE OF room_id, status, check_in, check_out OR DELETE
ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_room_status_from_reservation();

-- Apply the same timestamp behavior to maintenance records.
DROP TRIGGER IF EXISTS update_room_maintenance_updated_at ON public.room_maintenance;
CREATE TRIGGER update_room_maintenance_updated_at
BEFORE UPDATE ON public.room_maintenance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
