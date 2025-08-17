import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { View, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';

export default function Index() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isFirstLaunch } = useProfileStore();

  if (authLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (isFirstLaunch) {
      return <Redirect href="/onboarding" />;
    } else {
      return <Redirect href="/login" />;
    }
  }

  return <Redirect href="/(tabs)/cards" />;
}
