import { Dimensions } from 'react-native';


const { width, height } = Dimensions.get('window');

export default {
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
  },
  sizes: {
    screenWidth: width,
    screenHeight: height,
  },
};