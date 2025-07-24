-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Create login_events table
CREATE TABLE public.login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  logged_in_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on login_events
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for login_events
CREATE POLICY "Users can view their own login events" 
ON public.login_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create login events" 
ON public.login_events 
FOR INSERT 
WITH CHECK (true);

-- Add version column to documents
ALTER TABLE public.documents ADD COLUMN version INTEGER DEFAULT 1;

-- Add archived columns
ALTER TABLE public.cases ADD COLUMN archived BOOLEAN DEFAULT false;
ALTER TABLE public.documents ADD COLUMN archived BOOLEAN DEFAULT false;

-- Add timestamp columns to cases
ALTER TABLE public.cases
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;

-- Add tags and due_date to cases
ALTER TABLE public.cases
ADD COLUMN tags TEXT[],
ADD COLUMN due_date DATE;

-- Create webhook_events table
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  retries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on webhook_events (admin only)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhook_events
CREATE POLICY "Only admins can manage webhook events" 
ON public.webhook_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at columns
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_events_updated_at
BEFORE UPDATE ON public.webhook_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_login_events_user_id ON public.login_events(user_id);
CREATE INDEX idx_cases_archived ON public.cases(archived);
CREATE INDEX idx_cases_due_date ON public.cases(due_date);
CREATE INDEX idx_documents_archived ON public.documents(archived);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);