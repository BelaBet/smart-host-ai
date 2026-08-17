-- Reservation integrity: validate dates and prevent overlapping active reservations.
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_valid_dates CHECK (check_out > check_in),
  ADD CONSTRAINT reservations_nonnegative_guests CHECK (adults >= 1 AND children >= 0),
  ADD CONSTRAINT reservations_nonnegative_total CHECK (total_value >= 0);

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_no_overlap_active
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('pending', 'confirmed', 'checked_in'));

REVOKE ALL ON public.reservations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
