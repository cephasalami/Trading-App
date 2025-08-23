# NFC Feature Implementation

This document describes the NFC (Near Field Communication) functionality that has been added to the Trading App.

## Overview

The NFC feature allows users to:
- **Read NFC tags** containing profile data, contact information, or URLs
- **Write data to NFC tags** including profiles, contacts, and URLs
- **Scan NFC tags** as an alternative to QR codes
- **Share profiles via NFC** for quick contact exchange

## Components Added

### 1. NFC Utility Library (`lib/nfc.ts`)
Core NFC functionality including:
- `initNFC()` - Initialize NFC manager
- `isNFCSupported()` - Check if device supports NFC
- `isNFCEnabled()` - Check if NFC is enabled
- `readNFCTag()` - Read data from NFC tag
- `writeProfileToNFC()` - Write profile data to NFC tag
- `writeContactToNFC()` - Write contact data to NFC tag
- `writeURLToNFC()` - Write URL to NFC tag
- `parseNFCData()` - Parse NFC data into structured format

### 2. NFC Scanner Component (`components/NFCScanner.tsx`)
Modal component for scanning NFC tags:
- Real-time NFC tag scanning
- Support for different data types (profile, contact, URL, text)
- Visual feedback and status indicators
- Error handling and user guidance

### 3. NFC Writer Component (`components/NFCWriter.tsx`)
Modal component for writing data to NFC tags:
- Write profile data to NFC tags
- Write contact information to NFC tags
- Write URLs to NFC tags
- Multiple write mode selection
- Success/failure feedback

### 4. NFC Hook (`hooks/useNFC.ts`)
React hook providing NFC functionality:
- NFC status management
- Reading and writing operations
- Loading states and error handling
- Automatic cleanup

### 5. NFC Demo Component (`components/NFCDemo.tsx`)
Testing and demonstration component:
- NFC status display
- Read/write testing
- Sample data generation
- User instructions

## Integration Points

### Scan Screen
- Added NFC as a new scan mode
- Integrated NFC scanner modal
- NFC-specific instructions and UI

### Share Screen
- Added "Write Profile to NFC Tag" option
- Integrated NFC writer modal
- Profile and URL writing capabilities

### Profile Card Component
- Added NFC write button
- Quick NFC sharing functionality

### Settings Screen
- Added NFC section with demo access
- NFC testing and configuration

## Android Configuration

### Permissions
Added to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

### Features
- NFC permission for reading/writing tags
- Optional NFC hardware requirement (app works without NFC)

## Data Formats

### Profile Data
```json
{
  "type": "profile",
  "data": {
    "id": "profile-id",
    "name": "John Doe",
    "headline": "Software Engineer",
    "contactInfo": { ... },
    "socialLinks": [ ... ]
  },
  "timestamp": 1234567890
}
```

### Contact Data
```json
{
  "type": "contact",
  "data": { ... },
  "timestamp": 1234567890
}
```

### URL Data
```json
{
  "type": "url",
  "data": "https://example.com",
  "timestamp": 1234567890
}
```

## Usage Instructions

### Reading NFC Tags
1. Open the Scan screen
2. Select "NFC" mode
3. Tap "Start Scanning"
4. Hold phone near NFC tag
5. Wait for success confirmation

### Writing to NFC Tags
1. Open Share screen or Profile Card
2. Tap "Write Profile to NFC Tag" or NFC button
3. Select data type (Profile, Contact, or URL)
4. Tap "Write NFC Tag"
5. Hold phone near writable NFC tag
6. Wait for success confirmation

### Testing NFC Functionality
1. Go to Settings
2. Tap "NFC Demo & Testing"
3. Use demo buttons to test read/write operations
4. Check NFC status and troubleshoot issues

## Error Handling

### Common Issues
- **NFC Not Supported**: Device doesn't have NFC hardware
- **NFC Disabled**: NFC is turned off in device settings
- **Read Failed**: Tag is not readable or corrupted
- **Write Failed**: Tag is not writable or full

### Troubleshooting
1. Ensure NFC is enabled in device settings
2. Check if device supports NFC
3. Hold phone closer to NFC tag
4. Try different NFC tags
5. Restart the app if issues persist

## Security Considerations

### Data Privacy
- NFC data is stored locally on the device
- No automatic cloud synchronization of NFC data
- User controls what data is written to tags

### Tag Security
- Only write data to trusted NFC tags
- Be aware that NFC tags can be read by any NFC-enabled device
- Consider using encrypted or password-protected tags for sensitive data

## Performance Notes

### Battery Impact
- NFC operations are brief and low-power
- No continuous background scanning
- Automatic cleanup after operations

### Memory Usage
- Minimal memory footprint
- Efficient data parsing and storage
- Automatic garbage collection

## Future Enhancements

### Potential Features
- Encrypted NFC data storage
- NFC tag management and organization
- Batch NFC operations
- NFC tag templates and presets
- Integration with smart home devices

### Platform Support
- Enhanced iOS NFC support
- Web NFC API integration
- Cross-platform NFC sharing

## Testing

### Test Scenarios
1. **Basic NFC Reading**: Read various NFC tag types
2. **Data Writing**: Write different data types to tags
3. **Error Handling**: Test with unsupported tags
4. **Performance**: Measure read/write speeds
5. **Compatibility**: Test with different NFC tag brands

### Test Devices
- Android devices with NFC
- iOS devices with NFC (iPhone 7+)
- Various NFC tag types (NTAG213, NTAG215, NTAG216)

## Dependencies

### Required Packages
- `react-native-nfc-manager`: Core NFC functionality
- `expo-haptics`: Haptic feedback for NFC operations

### Version Compatibility
- React Native 0.76+
- Expo SDK 53+
- Android API 21+ (Android 5.0+)
- iOS 13+ (for NFC reading)

## Support

For NFC-related issues:
1. Check device NFC compatibility
2. Verify NFC permissions
3. Test with known working NFC tags
4. Review error logs and console output
5. Consult device manufacturer NFC documentation

## License

NFC functionality is implemented using open-source libraries and follows the same license terms as the main application.
