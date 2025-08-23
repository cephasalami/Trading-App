import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.lastUpdated}>Last updated: August 20, 2025</Text>

      <Text style={styles.heading}>1. Introduction</Text>
      <Text style={styles.paragraph}>
        Welcome to our application. We are committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
      </Text>

      <Text style={styles.heading}>2. Information We Collect</Text>
      <Text style={styles.paragraph}>
        We may collect information about you in a variety of ways. The information we may collect via the Application includes:
        - Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Application.
        - Derivative Data: Information our servers automatically collect when you access the Application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Application.
      </Text>

      <Text style={styles.heading}>3. Use of Your Information</Text>
      <Text style={styles.paragraph}>
        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
        - Create and manage your account.
        - Email you regarding your account or order.
        - Fulfill and manage purchases, orders, payments, and other transactions related to the Application.
      </Text>

      <Text style={styles.heading}>4. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Information]
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
