-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('customer', 'case_handler', 'lawyer', 'admin');

-- Create case status enum
CREATE TYPE public.case_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'archived');

-- Create document type enum
CREATE TYPE public.document_type AS ENUM ('testament', 'death_certificate', 'identity', 'bank_statement', 'valuation', 'other');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  personal_number TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  deceased_personal_number TEXT NOT NULL,
  deceased_name TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_handler_id UUID REFERENCES auth.users(id),
  assigned_lawyer_id UUID REFERENCES auth.users(id),
  status case_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT,
  estate_value DECIMAL(15,2),
  heir_count INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_activities table for audit trail
CREATE TABLE public.case_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'case_handler') OR
  public.has_role(auth.uid(), 'lawyer') OR
  public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for cases
CREATE POLICY "Customers can view their own cases"
ON public.cases FOR SELECT
TO authenticated
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create cases"
ON public.cases FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff can view assigned cases"
ON public.cases FOR SELECT
TO authenticated
USING (
  auth.uid() = assigned_handler_id OR
  auth.uid() = assigned_lawyer_id OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Staff can update assigned cases"
ON public.cases FOR UPDATE
TO authenticated
USING (
  auth.uid() = assigned_handler_id OR
  auth.uid() = assigned_lawyer_id OR
  public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for documents
CREATE POLICY "Users can view case documents"
ON public.documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = case_id
    AND (
      c.customer_id = auth.uid() OR
      c.assigned_handler_id = auth.uid() OR
      c.assigned_lawyer_id = auth.uid() OR
      public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "Users can upload documents to their cases"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = case_id
    AND (
      c.customer_id = auth.uid() OR
      c.assigned_handler_id = auth.uid() OR
      c.assigned_lawyer_id = auth.uid() OR
      public.has_role(auth.uid(), 'admin')
    )
  )
);

-- RLS Policies for case_activities
CREATE POLICY "Users can view case activities"
ON public.case_activities FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cases c
    WHERE c.id = case_id
    AND (
      c.customer_id = auth.uid() OR
      c.assigned_handler_id = auth.uid() OR
      c.assigned_lawyer_id = auth.uid() OR
      public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "Users can create case activities"
ON public.case_activities FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('case-documents', 'case-documents', false);

-- Create storage policies
CREATE POLICY "Users can view case documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'case-documents' AND
  EXISTS (
    SELECT 1 FROM public.documents d
    JOIN public.cases c ON d.case_id = c.id
    WHERE d.file_path = name
    AND (
      c.customer_id = auth.uid() OR
      c.assigned_handler_id = auth.uid() OR
      c.assigned_lawyer_id = auth.uid() OR
      public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "Users can upload case documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-documents');

-- Generate case numbers function
CREATE OR REPLACE FUNCTION public.generate_case_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM public.cases
  WHERE case_number LIKE year_part || '-%';
  
  new_number := year_part || '-' || LPAD(sequence_part::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;