-- Create cases table for storing inheritance cases
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL DEFAULT 'ARV-' || extract(year from now()) || '-' || lpad(floor(random() * 10000)::text, 4, '0'),
  email TEXT NOT NULL,
  phone TEXT,
  inheritance_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  stripe_session_id TEXT,
  total_amount INTEGER NOT NULL DEFAULT 20000, -- 200 SEK in öre
  currency TEXT NOT NULL DEFAULT 'sek',
  access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '90 days')
);

-- Create signing_requests table for document signing
CREATE TABLE public.signing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  email TEXT NOT NULL,
  inheritance_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signing_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for cases (accessible by access_token)
CREATE POLICY "cases_select_by_token" ON public.cases
FOR SELECT
USING (true); -- Public read access for now, we'll handle auth in the app

CREATE POLICY "cases_insert_public" ON public.cases
FOR INSERT
WITH CHECK (true);

CREATE POLICY "cases_update_public" ON public.cases
FOR UPDATE
USING (true);

-- Create policies for signing_requests
CREATE POLICY "signing_requests_select_by_token" ON public.signing_requests
FOR SELECT
USING (true);

CREATE POLICY "signing_requests_update_by_token" ON public.signing_requests
FOR UPDATE
USING (true);

CREATE POLICY "signing_requests_insert_public" ON public.signing_requests
FOR INSERT
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_cases_access_token ON public.cases(access_token);
CREATE INDEX idx_cases_email ON public.cases(email);
CREATE INDEX idx_signing_requests_token ON public.signing_requests(token);
CREATE INDEX idx_signing_requests_case_id ON public.signing_requests(case_id);