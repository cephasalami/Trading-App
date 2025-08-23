CREATE TABLE nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);