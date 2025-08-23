# Supabase Setup Guide

## Environment Configuration

Create a `.env` file in your project root with the following content:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tokrdbyyzvtvqcymoodg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRva3JkYnl5enZ0dnFjeW1vb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTkyNzksImV4cCI6MjA2ODQ5NTI3OX0.dNMeBI47nOB_jsMq6oEsrv6PKlJzYUqRM_zzKQuTs7Y
```

## Database Schema

Your database is already properly configured with the following key tables:

- `users` - Main user records with `auth_user_id` linking to Supabase Auth
- `profiles` - User profile information
- `links` - Social media and other links
- `contacts` - Contact management
- `nfc_devices` - NFC tag management
- `nfc_interactions` - NFC interaction logging

## Authentication Flow

1. **Signup**: User creates Supabase Auth account
2. **Profile Setup**: User completes profile information in account-setup.tsx
3. **Database Creation**: User record is created in the `users` table with `auth_user_id` link
4. **Profile Creation**: Profile record is created in the `profiles` table
5. **Email Verification**: User verifies email address

## Key Features

- ✅ Proper Supabase Auth integration
- ✅ Row Level Security (RLS) enabled
- ✅ Session persistence with AsyncStorage
- ✅ Type-safe database operations
- ✅ NFC integration with analytics
- ✅ Contact management system

## Testing

To test the authentication flow:

1. Start your app
2. Navigate to account setup
3. Complete the signup process
4. Check your Supabase dashboard for new user records
5. Verify the `auth_user_id` link is properly set

## Troubleshooting

If you encounter issues:

1. Check that your `.env` file is properly configured
2. Verify your Supabase project is active
3. Check the browser console for error messages
4. Verify RLS policies are working correctly
5. Check that all required tables exist in your database
