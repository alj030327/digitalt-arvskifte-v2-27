-- Update cases table to have 1-year access instead of lifetime
ALTER TABLE public.cases 
ALTER COLUMN expires_at SET DEFAULT (now() + INTERVAL '1 year');