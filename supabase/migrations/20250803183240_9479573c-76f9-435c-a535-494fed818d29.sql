-- Fix RLS policies for signing_requests table to allow edge function access
DROP POLICY IF EXISTS "System can create signing requests" ON public.signing_requests;

-- Create policy that allows authenticated users to create signing requests
CREATE POLICY "Authenticated users can create signing requests" 
ON public.signing_requests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow the edge function to update records
DROP POLICY IF EXISTS "Anyone can update signing requests by token" ON public.signing_requests;

CREATE POLICY "Authenticated users can update signing requests" 
ON public.signing_requests 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);