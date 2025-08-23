-- Create nfc_interactions table (nfc_devices already exists)
CREATE TABLE IF NOT EXISTS public.nfc_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.nfc_devices(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'read', 'write', 'scan'
    interaction_data JSONB,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for nfc_interactions
CREATE INDEX IF NOT EXISTS idx_nfc_interactions_user_id ON public.nfc_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_nfc_interactions_tag_id ON public.nfc_interactions(tag_id);
CREATE INDEX IF NOT EXISTS idx_nfc_interactions_created_at ON public.nfc_interactions(created_at);

-- Enable RLS on nfc_interactions
ALTER TABLE public.nfc_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for nfc_interactions
CREATE POLICY "Users can view their own NFC interactions" ON public.nfc_interactions
    FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

CREATE POLICY "Users can insert their own NFC interactions" ON public.nfc_interactions
    FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Update scan_history table to better handle NFC data
ALTER TABLE public.scan_history
ADD COLUMN IF NOT EXISTS nfc_tag_id UUID REFERENCES public.nfc_devices(id),
ADD COLUMN IF NOT EXISTS device_info JSONB,
ADD COLUMN IF NOT EXISTS location_info JSONB;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for nfc_devices table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_nfc_devices_updated_at'
    ) THEN
        CREATE TRIGGER update_nfc_devices_updated_at
            BEFORE UPDATE ON public.nfc_devices
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create function to log NFC interactions
CREATE OR REPLACE FUNCTION log_nfc_interaction(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION log_nfc_interaction TO authenticated;
