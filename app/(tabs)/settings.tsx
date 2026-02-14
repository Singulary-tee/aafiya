
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, DevSettings } from 'react-native';
import { useTranslation } from 'react-i18next';
import languageDetector from '../../src/i18n/languageDetector';
import { FontSwitcher } from '@/src/components/settings/FontSwitcher';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation(['settings']);

  const changeLanguage = (lng: string) => {
    if (i18n.language === lng) return;

    // Cache the selected language
    languageDetector.cacheUserLanguage(lng);

    // Set the layout direction
    const isRTL = lng === 'ar';
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);

    // Reload the app to apply changes
    DevSettings.reload();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings')}</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>{t('language')}</Text>
        <View style={styles.languageButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              i18n.language === 'en' && styles.activeButton,
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={styles.buttonText}>{t('english')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              i18n.language === 'ar' && styles.activeButton,
            ]}
            onPress={() => changeLanguage('ar')}
          >
            <Text style={styles.buttonText}>{t('arabic')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FontSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  settingItem: {
    marginBottom: 15,
  },
  settingText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'left',
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    color: '#000',
  },
});
