
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/src/hooks/useLanguage';
import Button from '@/src/components/common/Button';
import { Text } from '@/src/components/primitives/Text';
import { theme } from '@/src/constants/theme';

export const LanguageSwitcher: React.FC = () => {
  const { t } = useTranslation('settings');
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <Text size="body" weight="bold" style={styles.label}>{t('language')}</Text>
      <View style={styles.buttonsContainer}>
        <Button
          title={t('english')}
          onPress={() => changeLanguage('en')}
          variant={currentLanguage === 'en' ? 'primary' : 'secondary'}
          style={styles.button}
        />
        <Button
          title={t('arabic')}
          onPress={() => changeLanguage('ar')}
          variant={currentLanguage === 'ar' ? 'primary' : 'secondary'}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  button: {
    marginRight: theme.spacing.sm, // Add some space between the buttons
  },
});
