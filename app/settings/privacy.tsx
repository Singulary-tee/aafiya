import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/primitives/Text';
import { theme } from '@/src/constants/theme';
import { APP_CONFIG } from '@/src/constants/config';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation(['settings']);

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text size="headline" weight="bold" style={styles.title}>
        {t('privacy_title')}
      </Text>

      {/* Our Commitment */}
      <PolicySection title={t('privacy_commitment')} content={t('privacy_commitment_text')} />

      {/* Data Collection */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('data_collection')}
        </Text>
        <Text size="body" weight="bold" style={styles.highlight}>
          {t('data_collection_zero')}
        </Text>
        <Text size="body" style={styles.subsectionTitle}>
          {t('data_collection_specifics')}:
        </Text>
        <CheckItem text={t('no_analytics')} />
        <CheckItem text={t('no_crash_reporting')} />
        <CheckItem text={t('no_advertising')} />
        <CheckItem text={t('no_accounts')} />
        <CheckItem text={t('no_cloud')} />
      </View>

      {/* Data Storage */}
      <PolicySection title={t('data_storage')} content={t('data_storage_text')} />

      {/* Data You Control */}
      <PolicySection title={t('data_control')} content={t('data_control_text')} />

      {/* Network Access */}
      <PolicySection title={t('network_access')} content={t('network_access_text')} />

      {/* Family Helper Mode */}
      <PolicySection title={t('helper_mode_privacy')} content={t('helper_mode_privacy_text')} />

      {/* Third-Party Services */}
      <PolicySection title={t('third_party')} content={t('third_party_text')} />

      {/* Children's Privacy */}
      <PolicySection title={t('children_privacy')} content={t('children_privacy_text')} />

      {/* Changes to Policy */}
      <PolicySection title={t('policy_changes')} content={t('policy_changes_text')} />

      {/* Contact */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('privacy_contact')}
        </Text>
        <Text size="body" style={styles.sectionText}>
          {t('privacy_contact_text')}
        </Text>
        <TouchableOpacity onPress={() => openEmail(APP_CONFIG.PRIVACY_EMAIL)}>
          <Text size="body" style={styles.link}>
            {APP_CONFIG.PRIVACY_EMAIL}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Your Rights */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('your_rights')}
        </Text>
        <CheckItem text={t('right_access')} />
        <CheckItem text={t('right_export')} />
        <CheckItem text={t('right_delete')} />
        <CheckItem text={t('right_offline')} />
      </View>

      {/* Bottom Line */}
      <View style={[styles.section, styles.bottomLine]}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('bottom_line')}
        </Text>
        <Text size="body" weight="medium" style={styles.bottomLineText}>
          {t('bottom_line_text')}
        </Text>
      </View>
    </ScrollView>
  );
}

interface PolicySectionProps {
  title: string;
  content: string;
}

const PolicySection: React.FC<PolicySectionProps> = ({ title, content }) => (
  <View style={styles.section}>
    <Text size="subheading" weight="bold" style={styles.sectionTitle}>
      {title}
    </Text>
    <Text size="body" style={styles.sectionText}>
      {content}
    </Text>
  </View>
);

interface CheckItemProps {
  text: string;
}

const CheckItem: React.FC<CheckItemProps> = ({ text }) => (
  <View style={styles.checkItem}>
    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} style={styles.checkIcon} />
    <Text size="body" style={styles.checkText}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  subsectionTitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  sectionText: {
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  highlight: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  checkIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  checkText: {
    flex: 1,
    color: theme.colors.textSecondary,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    marginTop: theme.spacing.xs,
  },
  bottomLine: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  bottomLineText: {
    color: theme.colors.primary,
    lineHeight: 24,
  },
});
