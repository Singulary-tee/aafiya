import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/primitives/Text';
import { theme } from '@/src/constants/theme';
import { APP_CONFIG } from '@/src/constants/config';

export default function AboutScreen() {
  const { t, i18n } = useTranslation(['settings']);
  const isRTL = i18n.language === 'ar';

  const openGitHub = () => {
    Linking.openURL(APP_CONFIG.GITHUB_URL);
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconPlaceholder}>
          <Ionicons name="medical" size={64} color={theme.colors.primary} />
        </View>
      </View>

      {/* App Name */}
      <Text size="title" weight="bold" style={styles.appName}>
        {APP_CONFIG.APP_NAME}
      </Text>
      <Text size="title" weight="bold" style={styles.appNameArabic}>
        {APP_CONFIG.APP_NAME_AR}
      </Text>

      {/* Version Info */}
      <Text size="body" style={styles.version}>
        {t('version')} {APP_CONFIG.VERSION} ({APP_CONFIG.BUILD_NUMBER})
      </Text>

      <View style={styles.divider} />

      {/* Description */}
      <Text size="body" style={styles.description}>
        {t('app_description')}
      </Text>

      {/* Features */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('features')}
        </Text>
        <FeatureItem icon="wifi-off" text={t('feature_offline')} />
        <FeatureItem icon="people" text={t('feature_multiprofile')} />
        <FeatureItem icon="notifications" text={t('feature_reminders')} />
        <FeatureItem icon="fitness" text={t('feature_health')} />
        <FeatureItem icon="home" text={t('feature_helper')} />
      </View>

      {/* Data Sources */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('data_sources')}
        </Text>
        <Text size="body" style={styles.sectionText}>
          {t('data_sources_desc')}
        </Text>
        <Text size="small" style={styles.disclaimer}>
          {t('data_sources_disclaimer')}
        </Text>
      </View>

      {/* Open Source */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('open_source')}
        </Text>
        <Text size="body" style={styles.sectionText}>
          {t('mit_license')}
        </Text>
        <TouchableOpacity style={styles.button} onPress={openGitHub}>
          <Ionicons name="logo-github" size={20} color={theme.colors.surface} style={styles.buttonIcon} />
          <Text size="body" weight="medium" style={styles.buttonText}>
            {t('view_on_github')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('contact')}
        </Text>
        <TouchableOpacity onPress={() => openEmail(APP_CONFIG.SUPPORT_EMAIL)}>
          <Text size="body" style={styles.link}>
            {t('support_email')}: {APP_CONFIG.SUPPORT_EMAIL}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text size="body" style={styles.footer}>
        {t('footer')}
      </Text>
    </ScrollView>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={20} color={theme.colors.primary} style={styles.featureIcon} />
    <Text size="body" style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginVertical: theme.spacing.lg,
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appName: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  appNameArabic: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  sectionText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  disclaimer: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureIcon: {
    marginRight: theme.spacing.sm,
  },
  featureText: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.surface,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
