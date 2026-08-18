-- Harden access to hotel operational data and audit records.
-- Public/anonymous clients must never be able to read or mutate operational data.

-- Operational tables: authenticated users only.
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_maintenance ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "authenticated read rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update rooms" ON public.rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete rooms" ON public.rooms FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated read guests" ON public.guests FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert guests" ON public.guests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update guests" ON public.guests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete guests" ON public.guests FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated read reservations" ON public.reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update reservations" ON public.reservations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete reservations" ON public.reservations FOR DELETE TO authenticated USING (true);

CREATE POLICY "authenticated read room maintenance" ON public.room_maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated insert room maintenance" ON public.room_maintenance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update room maintenance" ON public.room_maintenance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated delete room maintenance" ON public.room_maintenance FOR DELETE TO authenticated USING (true);

-- Audit log: authenticated users can read for now; nobody can mutate it directly.
-- Admin-only filtering can be tightened later when a role/claims model is available.
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated users can read audit log" ON public.audit_log;
CREATE POLICY "authenticated users can read audit log" ON public.audit_log FOR SELECT TO authenticated USING (true);

REVOKE ALL ON public.audit_log FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM anon, authenticated;

-- Ensure audit triggers also cover the hotel entities requested by the audit screen.
DO $$
DECLARE
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'rooms',
    'guests',
    'reservations',
    'room_maintenance',
    'cashier_sessions',
    'cashier_transactions',
    'restaurant_products',
    'restaurant_orders',
    'restaurant_order_items'
  ] LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', v_table, v_table);
      EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.write_audit_log()',
        v_table, v_table
      );
    END IF;
  END LOOP;
END $$;
