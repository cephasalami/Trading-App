import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor?: (color: string) => void;
  onColorSelect?: (color: string) => void;
  title?: string;
  visible?: boolean;
  onClose?: () => void;
}

export default function ColorPicker({ selectedColor, onSelectColor, onColorSelect, title }: ColorPickerProps) {
  const handleColorSelect = (color: string) => {
    if (onSelectColor) onSelectColor(color);
    if (onColorSelect) onColorSelect(color);
  };
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <View style={styles.colorGrid}>
        {colors.cardColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              selectedColor === color && styles.selectedColor
            ]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: colors.text,
  },
});