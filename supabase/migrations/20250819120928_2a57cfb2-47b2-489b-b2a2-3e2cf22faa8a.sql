-- Create table to store estate process progress
CREATE TABLE public.estate_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL, -- We'll use email for identification since no auth is implemented
  deceased_first_name TEXT,
  deceased_last_name TEXT,
  deceased_personal_number TEXT,
  estate_owners JSONB DEFAULT '[]'::jsonb,
  assets JSONB DEFAULT '[]'::jsonb,
  physical_assets JSONB DEFAULT '[]'::jsonb,
  beneficiaries JSONB DEFAULT '[]'::jsonb,
  testament JSONB,
  has_testament BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by email
CREATE INDEX idx_estate_processes_user_email ON public.estate_processes(user_email);

-- Enable Row Level Security
ALTER TABLE public.estate_processes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access since no authentication is implemented
CREATE POLICY "Allow public access to estate processes"
ON public.estate_processes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_estate_processes_updated_at
    BEFORE UPDATE ON public.estate_processes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();