import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { light, dark } from '../constants/colors';

export const useTheme = () => {
  const themePreference = useSettingsStore((state) => state.theme);
  const systemTheme = useColorScheme();

  if (themePreference === 'system') {
    return systemTheme === 'dark' ? dark : light;
  }

  return themePreference === 'dark' ? dark : light;
};
