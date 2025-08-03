-- Create signing_requests table for storing signing requests
CREATE TABLE public.signing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  email TEXT,
  phone TEXT,
  inheritance_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data JSONB
);

-- Enable Row Level Security
ALTER TABLE public.signing_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for signing requests
CREATE POLICY "Anyone can view signing requests by token" 
ON public.signing_requests 
FOR SELECT 
USING (true);

CREATE POLICY "System can create signing requests" 
ON public.signing_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update signing requests by token" 
ON public.signing_requests 
FOR UPDATE 
USING (true);

-- Create index on token for faster lookups
CREATE INDEX idx_signing_requests_token ON public.signing_requests(token);
CREATE INDEX idx_signing_requests_expires_at ON public.signing_requests(expires_at);