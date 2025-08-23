-- Fix Security Issues - Enable RLS on public tables
-- Run this migration in your Supabase dashboard

-- Enable RLS on tables that are currently public
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for links table
CREATE POLICY "Users can view their own links" ON public.links
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own links" ON public.links
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can update their own links" ON public.links
    FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can delete their own links" ON public.links
    FOR DELETE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for visits table
CREATE POLICY "Users can view visits to their own links" ON public.visits
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = (SELECT user_id FROM public.links WHERE id = link_id)));

-- Create RLS policies for password_resets (only allow users to manage their own)
CREATE POLICY "Users can manage their own password resets" ON public.password_resets
    FOR ALL USING (email = auth.jwt() ->> 'email');

-- Create RLS policies for personal_access_tokens (only allow users to manage their own)
CREATE POLICY "Users can manage their own access tokens" ON public.personal_access_tokens
    FOR ALL USING (tokenable_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Create RLS policies for failed_jobs (admin only)
CREATE POLICY "Admin only access to failed jobs" ON public.failed_jobs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for migrations (admin only)
CREATE POLICY "Admin only access to migrations" ON public.migrations
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.log_nfc_interaction(
    p_user_id BIGINT,
    p_interaction_type VARCHAR(50),
    p_tag_id UUID DEFAULT NULL,
    p_interaction_data JSONB DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL,
    p_location_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_interaction_id UUID;
BEGIN
    INSERT INTO public.nfc_interactions (
        user_id,
        tag_id,
        interaction_type,
        interaction_data,
        device_info,
        location_info
    ) VALUES (
        p_user_id,
        p_tag_id,
        p_interaction_type,
        p_interaction_data,
        p_device_info,
        p_location_info
    ) RETURNING id INTO v_interaction_id;

    RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_nfc_interaction TO authenticated;
