import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const colors = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: { backgroundColor: colors.primary },
          text: { color: colors.card },
        };
      case 'secondary':
        return {
          button: { backgroundColor: colors.secondary },
          text: { color: colors.card },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case 'text':
        return {
          button: { backgroundColor: 'transparent', paddingHorizontal: 0 },
          text: { color: colors.primary },
        };
      default:
        return {};
    }
  };

  const sizeStyles = {
    small: {
      button: { paddingVertical: 8, paddingHorizontal: 16 },
      text: { fontSize: 14 },
    },
    medium: {
      button: { paddingVertical: 12, paddingHorizontal: 24 },
      text: { fontSize: 16 },
    },
    large: {
      button: { paddingVertical: 16, paddingHorizontal: 32 },
      text: { fontSize: 18 },
    },
  };

  const buttonStyles = [
    styles.button,
    sizeStyles[size].button,
    variant !== 'gradient' && getVariantStyles().button,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    sizeStyles[size].text,
    variant !== 'gradient' && getVariantStyles().text,
    disabled && styles.disabledText,
    textStyle,
  ];

  const renderButtonContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'text'
              ? colors.primary
              : colors.card
          }
          size="small"
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && icon}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && icon}
      </>
    );
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[style, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyles[size].button, styles.gradientButton]}
        >
          {renderButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  gradientButton: {
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
