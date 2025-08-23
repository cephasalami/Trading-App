import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { QueryProvider } from "@/providers/QueryProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import AuthGuard from "@/components/AuthGuard";
import colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      setInitError('Failed to load fonts');
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Set a timeout for initialization
        timeoutId = setTimeout(() => {
          console.warn('Initialization timeout - proceeding anyway');
          setIsInitialized(true);
        }, 5000) as ReturnType<typeof setTimeout>; // 5 second timeout
        
        await initializeAuth();
        
        clearTimeout(timeoutId);
        console.log('App initialization completed');
        setIsInitialized(true);
      } catch (err: any) {
        console.error('Initialization error:', err);
        clearTimeout(timeoutId);
        setInitError(err.message || 'Failed to initialize app');
        // Still set as initialized to prevent infinite loading
        setIsInitialized(true);
      }
    };

    if (loaded && !isInitialized) {
      initializeApp();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loaded, isInitialized, initializeAuth]);

  if (!loaded || !isInitialized) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ 
          color: colors.text, 
          marginTop: 16, 
          fontSize: 16 
        }}>
          {initError ? 'Starting app...' : 'Loading...'}
        </Text>
        {initError && (
          <Text style={{ 
            color: colors.error || '#FF6B6B', 
            marginTop: 8, 
            fontSize: 14,
            textAlign: 'center',
            paddingHorizontal: 20
          }}>
            {initError}
          </Text>
        )}
      </View>
    );
  }

  return (
    <QueryProvider>
      <RealtimeProvider>
        <StatusBar style="light" />
        <AuthGuard>
          <RootLayoutNav />
        </AuthGuard>
      </RealtimeProvider>
    </QueryProvider>
  );
}

function RootLayoutNav({ initialRoute }: { initialRoute?: string }) {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          presentation: "fullScreenModal"
        }} 
      />
      <Stack.Screen 
        name="account-setup" 
        options={{ 
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Log In",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="email-verification" 
        options={{ 
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="profile/[id]" 
        options={{ 
          title: "Profile Details",
        }} 
      />
      <Stack.Screen 
        name="profile/edit/[id]" 
        options={{ 
          title: "Edit Profile",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="profile/create" 
        options={{ 
          title: "Create Profile",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="contacts/[id]" 
        options={{ 
          title: "Contact Details",
        }} 
      />
      <Stack.Screen 
        name="scan/result" 
        options={{ 
          title: "Scan Result",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="legal/privacy" 
        options={{ 
          title: "Privacy Policy",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="legal/terms" 
        options={{ 
          title: "Terms of Service",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="nfc/manager" 
        options={{ 
          title: "NFC Manager",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="nfc/activate" 
        options={{ 
          title: "Activate NFC Tag",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="nfc/configure/[id]" 
        options={{ 
          title: "Configure NFC Tag",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="nfc/analytics" 
        options={{ 
          title: "NFC Analytics",
          presentation: "modal"
        }} 
      />
      <Stack.Screen 
        name="profile/settings" 
        options={{ 
          title: "Profile Settings",
          presentation: "modal"
        }} 
      />
    </Stack>
  );
}