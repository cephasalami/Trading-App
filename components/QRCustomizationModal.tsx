import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { X, Crown, Download, Share } from 'lucide-react-native';
import colors from '@/constants/colors';
import { generateCustomQRCodeUrl } from '@/lib/sharing';
import ColorPicker from './ColorPicker';
import Button from './Button';

interface QRCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
  onSave: (qrCodeUrl: string) => void;
  onShare: (qrCodeUrl: string) => void;
}

const QR_SIZES = [
  { label: 'Small (200px)', value: 200 },
  { label: 'Medium (400px)', value: 400 },
  { label: 'Large (600px)', value: 600 },
  { label: 'Extra Large (800px)', value: 800 },
];

const PRESET_COLORS = [
  { name: 'Black', foreground: '000000', background: 'FFFFFF' },
  { name: 'Blue', foreground: '1E40AF', background: 'FFFFFF' },
  { name: 'Green', foreground: '059669', background: 'FFFFFF' },
  { name: 'Purple', foreground: '7C3AED', background: 'FFFFFF' },
  { name: 'Red', foreground: 'DC2626', background: 'FFFFFF' },
  { name: 'Orange', foreground: 'EA580C', background: 'FFFFFF' },
  { name: 'White on Black', foreground: 'FFFFFF', background: '000000' },
  { name: 'Gold', foreground: 'F59E0B', background: '000000' },
];

export default function QRCustomizationModal({
  visible,
  onClose,
  profileId,
  profileName,
  onSave,
  onShare,
}: QRCustomizationModalProps) {
  const [selectedSize, setSelectedSize] = useState(400);
  const [foregroundColor, setForegroundColor] = useState('000000');
  const [backgroundColor, setBackgroundColor] = useState('FFFFFF');
  const [margin, setMargin] = useState(10);
  const [showColorPicker, setShowColorPicker] = useState<'foreground' | 'background' | null>(null);

  const customQRUrl = generateCustomQRCodeUrl(profileId, {
    size: selectedSize,
    color: foregroundColor,
    backgroundColor: backgroundColor,
    margin: margin,
  });

  const handlePresetColor = (preset: typeof PRESET_COLORS[0]) => {
    setForegroundColor(preset.foreground);
    setBackgroundColor(preset.background);
  };

  const handleSave = () => {
    onSave(customQRUrl);
    onClose();
  };

  const handleShare = () => {
    onShare(customQRUrl);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Crown size={20} color="#FFD700" />
            <Text style={styles.title}>Customize QR Code</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <Image source={{ uri: customQRUrl }} style={styles.previewImage} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Size</Text>
            <View style={styles.sizeOptions}>
              {QR_SIZES.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.sizeOption,
                    selectedSize === size.value && styles.selectedSizeOption,
                  ]}
                  onPress={() => setSelectedSize(size.value)}
                >
                  <Text
                    style={[
                      styles.sizeOptionText,
                      selectedSize === size.value && styles.selectedSizeOptionText,
                    ]}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Color Presets</Text>
            <View style={styles.presetColors}>
              {PRESET_COLORS.map((preset) => (
                <TouchableOpacity
                  key={preset.name}
                  style={[
                    styles.presetColor,
                    {
                      backgroundColor: `#${preset.background}`,
                      borderColor: `#${preset.foreground}`,
                    },
                  ]}
                  onPress={() => handlePresetColor(preset)}
                >
                  <View
                    style={[
                      styles.presetColorInner,
                      { backgroundColor: `#${preset.foreground}` },
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Colors</Text>
            <View style={styles.colorRow}>
              <View style={styles.colorInput}>
                <Text style={styles.colorLabel}>Foreground</Text>
                <TouchableOpacity
                  style={[styles.colorPreview, { backgroundColor: `#${foregroundColor}` }]}
                  onPress={() => setShowColorPicker('foreground')}
                />
                <TextInput
                  style={styles.colorTextInput}
                  value={foregroundColor}
                  onChangeText={setForegroundColor}
                  placeholder="000000"
                  maxLength={6}
                />
              </View>
              <View style={styles.colorInput}>
                <Text style={styles.colorLabel}>Background</Text>
                <TouchableOpacity
                  style={[styles.colorPreview, { backgroundColor: `#${backgroundColor}` }]}
                  onPress={() => setShowColorPicker('background')}
                />
                <TextInput
                  style={styles.colorTextInput}
                  value={backgroundColor}
                  onChangeText={setBackgroundColor}
                  placeholder="FFFFFF"
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Margin</Text>
            <View style={styles.marginContainer}>
              <TextInput
                style={styles.marginInput}
                value={margin.toString()}
                onChangeText={(text) => setMargin(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="10"
              />
              <Text style={styles.marginLabel}>pixels</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Save to Photos"
              onPress={handleSave}
              variant="outline"
              icon={<Download size={18} color={colors.primary} />}
              style={styles.actionButton}
            />
            <Button
              title="Share QR Code"
              onPress={handleShare}
              variant="gradient"
              icon={<Share size={18} color="white" />}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>

        {showColorPicker && (
          <ColorPicker
            onClose={() => setShowColorPicker(null)}
            onColorSelect={(color: string) => {
              if (showColorPicker === 'foreground') {
                setForegroundColor(color.replace('#', ''));
              } else {
                setBackgroundColor(color.replace('#', ''));
              }
              setShowColorPicker(null);
            }}
            selectedColor={`#${showColorPicker === 'foreground' ? foregroundColor : backgroundColor}`}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  previewContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedSizeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sizeOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedSizeOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  presetColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetColorInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
  },
  colorInput: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  colorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorTextInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    textAlign: 'center',
    fontSize: 14,
    width: '100%',
  },
  marginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marginInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 14,
    width: 80,
    textAlign: 'center',
  },
  marginLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});