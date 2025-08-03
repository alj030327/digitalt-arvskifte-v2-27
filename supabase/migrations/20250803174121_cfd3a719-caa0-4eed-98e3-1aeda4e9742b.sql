-- Create signing_requests table for tracking inheritance document signing
CREATE TABLE public.signing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  inheritance_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.signing_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create signing requests" 
ON public.signing_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own signing requests" 
ON public.signing_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view signing requests by token" 
ON public.signing_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update signing requests by token" 
ON public.signing_requests 
FOR UPDATE 
USING (true);

-- Add trigger for timestamps
CREATE TRIGGER update_signing_requests_updated_at
BEFORE UPDATE ON public.signing_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();