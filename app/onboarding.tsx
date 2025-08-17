import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfileStore } from '@/store/profileStore';
import colors from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { setFirstLaunchComplete } = useProfileStore();
  
  const handleCreateAccount = () => {
    setFirstLaunchComplete();
    router.replace('/account-setup');
  };
  
  const handleLogin = () => {
    setFirstLaunchComplete();
    router.replace('/login');
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#000000', '#1A1A1A', '#000000']}
        style={styles.gradient}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: "https://i.postimg.cc/D09TtsFn/image.png" }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Phone Mockup Section */}
        <View style={styles.phoneContainer}>
          <View style={styles.phoneWrapper}>
            <Image
              source={{ uri: "https://i.postimg.cc/W1QkXYxH/image.png" }}
              style={styles.phoneImage}
              resizeMode="contain"
            />
          </View>
        </View>
        
        {/* Welcome Text Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>to the future of business cards</Text>
          <Text style={styles.welcomeDescription}>
            Share your digital business card instantly with a simple tap, scan, or link
          </Text>
        </View>
        
        {/* Action Buttons Section */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.createAccountButton}
            onPress={handleCreateAccount}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.createAccountText}>Create account</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.signInContainer}>
            <Text style={styles.alreadyText}>Already registered? </Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View style={styles.decorativeElements}>
          <View style={[styles.decorativeCircle, styles.circle1]} />
          <View style={[styles.decorativeCircle, styles.circle2]} />
          <View style={[styles.decorativeCircle, styles.circle3]} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingHorizontal: 20,
    marginBottom: height * 0.02,
  },
  logo: {
    width: width * 0.4,
    height: 60,
  },
  phoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxHeight: height * 0.4,
  },
  phoneWrapper: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  phoneImage: {
    width: width * 0.65,
    height: width * 0.65,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: height * 0.08,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 22,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  actionContainer: {
    paddingHorizontal: 32,
    paddingBottom: height * 0.06,
    alignItems: 'center',
  },
  createAccountButton: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alreadyText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: colors.primary,
    top: height * 0.1,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: colors.secondary,
    bottom: height * 0.3,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: colors.primary,
    top: height * 0.4,
    left: width * 0.1,
  },
});