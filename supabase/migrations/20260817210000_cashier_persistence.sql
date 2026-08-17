-- Persistent cashier sessions and transactions
CREATE TYPE public.cashier_session_status AS ENUM ('open', 'closed');
CREATE TYPE public.cashier_transaction_type AS ENUM ('income', 'expense');

CREATE TABLE public.cashier_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
  closing_balance NUMERIC(12,2),
  expected_balance NUMERIC(12,2),
  difference NUMERIC(12,2),
  status public.cashier_session_status NOT NULL DEFAULT 'open',
  opened_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  closed_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.cashier_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.cashier_sessions(id) ON DELETE RESTRICT,
  type public.cashier_transaction_type NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 200),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  room_number TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT
);

CREATE INDEX cashier_sessions_status_idx ON public.cashier_sessions(status);
CREATE INDEX cashier_transactions_session_idx ON public.cashier_transactions(session_id);
CREATE INDEX cashier_transactions_created_at_idx ON public.cashier_transactions(created_at);

ALTER TABLE public.cashier_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashier_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read cashier sessions"
  ON public.cashier_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users can create cashier sessions"
  ON public.cashier_sessions FOR INSERT TO authenticated WITH CHECK (opened_by = auth.uid());
CREATE POLICY "authenticated users can update cashier sessions"
  ON public.cashier_sessions FOR UPDATE TO authenticated
  USING (opened_by = auth.uid() OR closed_by = auth.uid())
  WITH CHECK (opened_by = auth.uid() OR closed_by = auth.uid());

CREATE POLICY "authenticated users can read cashier transactions"
  ON public.cashier_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users can create cashier transactions"
  ON public.cashier_transactions FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "authenticated users can soft delete cashier transactions"
  ON public.cashier_transactions FOR UPDATE TO authenticated
  USING (created_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL AND deleted_by = auth.uid());

-- Prevent more than one open cashier session globally.
CREATE UNIQUE INDEX one_open_cashier_session_idx
  ON public.cashier_sessions ((status))
  WHERE status = 'open';

-- Atomic helper for the frontend: opens only if no session is currently open.
CREATE OR REPLACE FUNCTION public.open_cashier(p_opening_balance NUMERIC)
RETURNS public.cashier_sessions
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE v_session public.cashier_sessions;
BEGIN
  IF p_opening_balance < 0 THEN
    RAISE EXCEPTION 'Saldo inicial inválido';
  END IF;

  INSERT INTO public.cashier_sessions (opening_balance, opened_by)
  VALUES (p_opening_balance, auth.uid())
  RETURNING * INTO v_session;

  RETURN v_session;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Já existe um caixa aberto';
END;
$$;

-- Atomic close operation calculates expected balance from persisted transactions.
CREATE OR REPLACE FUNCTION public.close_cashier(p_session_id UUID, p_closing_balance NUMERIC, p_notes TEXT DEFAULT NULL)
RETURNS public.cashier_sessions
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_session public.cashier_sessions;
  v_income NUMERIC(12,2);
  v_expense NUMERIC(12,2);
  v_expected NUMERIC(12,2);
BEGIN
  IF p_closing_balance < 0 THEN
    RAISE EXCEPTION 'Saldo final inválido';
  END IF;

  SELECT * INTO v_session
  FROM public.cashier_sessions
  WHERE id = p_session_id AND status = 'open'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Caixa não encontrado ou já fechado';
  END IF;

  SELECT
    COALESCE(SUM(amount) FILTER (WHERE type = 'income' AND deleted_at IS NULL), 0),
    COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND deleted_at IS NULL), 0)
  INTO v_income, v_expense
  FROM public.cashier_transactions
  WHERE session_id = p_session_id;

  v_expected := v_session.opening_balance + v_income - v_expense;

  UPDATE public.cashier_sessions
  SET closed_at = now(),
      closing_balance = p_closing_balance,
      expected_balance = v_expected,
      difference = p_closing_balance - v_expected,
      status = 'closed',
      closed_by = auth.uid(),
      notes = p_notes
  WHERE id = p_session_id
  RETURNING * INTO v_session;

  RETURN v_session;
END;
$$;

REVOKE ALL ON FUNCTION public.open_cashier(NUMERIC) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.close_cashier(UUID, NUMERIC, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_cashier(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_cashier(UUID, NUMERIC, TEXT) TO authenticated;
