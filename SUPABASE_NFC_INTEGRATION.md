# Supabase NFC Integration Guide

This document describes how the NFC functionality has been integrated with your Supabase backend to provide data persistence, analytics, and user management.

## 🗄️ Database Schema

### New Tables Created

#### 1. `nfc_tags` Table
Stores information about NFC tags written by users.

```sql
CREATE TABLE public.nfc_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tag_uid VARCHAR(255) UNIQUE NOT NULL,
    tag_type VARCHAR(100) NOT NULL,
    tag_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**Fields:**
- `id`: Unique identifier for the NFC tag record
- `user_id`: Reference to the user who created the tag
- `profile_id`: Reference to the profile data stored on the tag
- `tag_uid`: Unique identifier of the physical NFC tag
- `tag_type`: Type of data stored (profile, contact, url, text)
- `tag_data`: JSON data stored on the NFC tag
- `is_active`: Whether the tag is currently active
- `last_used`: Timestamp of last interaction
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### 2. `nfc_interactions` Table
Tracks all NFC read/write operations for analytics and debugging.

```sql
CREATE TABLE public.nfc_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.nfc_tags(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL,
    interaction_data JSONB,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**Fields:**
- `id`: Unique identifier for the interaction
- `user_id`: Reference to the user performing the action
- `tag_id`: Reference to the NFC tag (if applicable)
- `interaction_type`: Type of interaction (read, write, scan)
- `interaction_data`: Additional data about the interaction
- `device_info`: Device information (platform, version, model)
- `location_info`: Location data (latitude, longitude, accuracy)
- `created_at`: When the interaction occurred

### Enhanced Tables

#### `scan_history` Table Updates
Added NFC-specific fields to existing scan history:

```sql
ALTER TABLE public.scan_history 
ADD COLUMN nfc_tag_id UUID REFERENCES public.nfc_tags(id),
ADD COLUMN device_info JSONB,
ADD COLUMN location_info JSONB;
```

## 🔧 Database Functions

### 1. `update_updated_at_column()`
Automatically updates the `updated_at` timestamp when records are modified.

### 2. `log_nfc_interaction()`
Logs NFC interactions with device and location information.

```sql
CREATE OR REPLACE FUNCTION log_nfc_interaction(
    p_user_id BIGINT,
    p_tag_id UUID DEFAULT NULL,
    p_interaction_type VARCHAR(50),
    p_interaction_data JSONB DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL,
    p_location_info JSONB DEFAULT NULL
)
RETURNS UUID
```

## 🛡️ Row Level Security (RLS)

### NFC Tags Security
- Users can only view, create, update, and delete their own NFC tags
- Tags are automatically associated with the authenticated user

### NFC Interactions Security
- Users can only view and create their own interaction records
- All interactions are tied to authenticated users

### Scan History Security
- Users can only view and create their own scan records
- NFC tag references maintain data integrity

## 📱 Frontend Integration

### New Files Created

#### 1. `lib/nfc-supabase.ts`
Core Supabase integration for NFC operations:

**Key Functions:**
- `upsertNFCTag()`: Create or update NFC tag records
- `getUserNFCTags()`: Retrieve user's NFC tags
- `logNFCInteraction()`: Log NFC operations
- `getNFCAnalytics()`: Get NFC usage statistics
- `getDeviceInfo()`: Collect device information
- `getLocationInfo()`: Collect location data (with permission)

#### 2. `components/NFCManager.tsx`
Comprehensive NFC management interface:

**Features:**
- View all user's NFC tags
- Tag status management (active/inactive)
- Delete NFC tags
- View interaction history
- Analytics dashboard
- Pull-to-refresh functionality

### Enhanced Files

#### 1. `lib/nfc.ts`
Updated to integrate with Supabase:

**New Features:**
- Automatic logging of NFC operations
- Tag data persistence
- Enhanced scan tracking
- Error handling with Supabase fallbacks

#### 2. `app/(tabs)/settings.tsx`
Updated with NFC management options:

**New Sections:**
- NFC Manager access
- NFC Analytics access
- NFC Demo & Testing access

## 🚀 Setup Instructions

### 1. Run Database Migration
Execute the SQL migration file in your Supabase dashboard:

```bash
# Copy the contents of supabase/migrations/20241220000000_create_nfc_tables.sql
# and run it in your Supabase SQL editor
```

### 2. Install Additional Dependencies
```bash
npx expo install expo-device expo-location
```

### 3. Environment Variables
Ensure your Supabase environment variables are set:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Location Permissions
Add location permissions to your app configuration:

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location for NFC analytics."
        }
      ]
    ]
  }
}
```

## 📊 Analytics & Insights

### Available Metrics
- **Total NFC Tags**: Number of tags created by user
- **Total Interactions**: All NFC operations performed
- **Interaction Types**: Breakdown by read/write/scan
- **Device Information**: Platform, version, model data
- **Location Data**: Geographic usage patterns
- **Usage Timeline**: Historical interaction data

### Data Collection
- **Automatic**: All NFC operations are logged automatically
- **Device Info**: Platform, version, model, brand
- **Location**: GPS coordinates (with user permission)
- **Timestamps**: Precise timing of all operations
- **Error Tracking**: Failed operations are logged for debugging

## 🔒 Privacy & Security

### Data Protection
- **User Isolation**: Users can only access their own data
- **Permission-Based**: Location data requires explicit user consent
- **Secure Storage**: All data stored in Supabase with RLS policies
- **No External Sharing**: Data remains within your Supabase instance

### Location Privacy
- Location data is only collected with explicit user permission
- Users can deny location access without losing NFC functionality
- Location data is used only for analytics and debugging

## 🧪 Testing & Development

### Testing NFC Operations
1. **Write Operations**: Use NFC Writer component to write to tags
2. **Read Operations**: Use NFC Scanner to read from tags
3. **Data Persistence**: Check Supabase tables for created records
4. **Analytics**: View interaction logs and statistics

### Debugging
- Check browser console for Supabase operation logs
- Verify RLS policies are working correctly
- Test with different user accounts
- Monitor database performance

## 📈 Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Efficient JSONB queries for tag data
- Pagination for large interaction histories
- Automatic cleanup of old records

### Frontend Optimization
- Lazy loading of NFC data
- Efficient state management
- Optimized re-renders
- Background data synchronization

## 🔮 Future Enhancements

### Planned Features
- **Batch Operations**: Multiple tag management
- **Tag Templates**: Predefined data structures
- **Advanced Analytics**: Machine learning insights
- **Tag Sharing**: Collaborative tag management
- **Offline Support**: Local caching with sync

### Integration Opportunities
- **Webhooks**: Real-time notifications
- **API Endpoints**: External system integration
- **Export Features**: Data portability
- **Backup Systems**: Data redundancy

## 🆘 Troubleshooting

### Common Issues

#### 1. RLS Policy Errors
**Problem**: Users can't access NFC data
**Solution**: Verify RLS policies are enabled and correct

#### 2. Location Permission Denied
**Problem**: Location data not being collected
**Solution**: Check location permissions in device settings

#### 3. Database Connection Issues
**Problem**: Supabase operations failing
**Solution**: Verify environment variables and network connectivity

#### 4. NFC Tag Not Found
**Problem**: Tags not appearing in manager
**Solution**: Check if tags were written with Supabase integration enabled

### Debug Commands
```bash
# Check Supabase connection
npx supabase status

# View database logs
npx supabase logs

# Reset development database
npx supabase db reset
```

## 📚 API Reference

### NFC Tag Operations
```typescript
// Create/Update tag
const tag = await upsertNFCTag(tagUid, tagType, tagData, profileId);

// Get user's tags
const tags = await getUserNFCTags();

// Get tag by UID
const tag = await getNFCTagByUID(tagUid);

// Delete tag
const success = await deleteNFCTag(tagId);

// Deactivate tag
const success = await deactivateNFCTag(tagId);
```

### Interaction Logging
```typescript
// Log interaction
const interactionId = await logNFCInteraction(
  'read',
  tagId,
  { data_type: 'profile' }
);

// Log scan
const success = await logScanToHistory(
  'nfc',
  scanData,
  profileId,
  nfcTagId
);
```

### Analytics
```typescript
// Get analytics
const analytics = await getNFCAnalytics();

// Get interaction history
const interactions = await getNFCInteractionHistory();
```

## 🤝 Support

For issues related to the Supabase NFC integration:

1. **Check Logs**: Review browser console and Supabase logs
2. **Verify Setup**: Ensure all migration steps are completed
3. **Test Permissions**: Verify RLS policies and user authentication
4. **Database Queries**: Use Supabase dashboard to inspect data
5. **Environment**: Confirm all environment variables are set

## 📄 License

This NFC integration follows the same license terms as your main application and uses standard Supabase features available in all plans.
