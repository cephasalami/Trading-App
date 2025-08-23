import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '@/constants/colors';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.lastUpdated}>Last updated: August 20, 2025</Text>

      <Text style={styles.heading}>1. Agreement to Terms</Text>
      <Text style={styles.paragraph}>
        By using our Application, you agree to be bound by these Terms of Service. If you do not agree to these Terms of Service, do not use the Application.
      </Text>

      <Text style={styles.heading}>2. Intellectual Property Rights</Text>
      <Text style={styles.paragraph}>
        Unless otherwise indicated, the Application is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Application (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
      </Text>

      <Text style={styles.heading}>3. User Representations</Text>
      <Text style={styles.paragraph}>
        By using the Application, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service; (4) you are not a minor in the jurisdiction in which you reside; (5) you will not access the Application through automated or non-human means, whether through a bot, script or otherwise; (6) you will not use the Application for any illegal or unauthorized purpose; and (7) your use of the Application will not violate any applicable law or regulation.
      </Text>

      <Text style={styles.heading}>4. Contact Us</Text>
      <Text style={styles.paragraph}>
        If you have questions or comments about these Terms of Service, please contact us at: [Your Contact Information]
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
