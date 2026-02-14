import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useFontSettings } from '@/src/hooks/useFontSettings';
import { useTranslation } from 'react-i18next';

export const FontSwitcher: React.FC = () => {
  const { useCustomFonts, setUseCustomFonts } = useFontSettings();
  const { t } = useTranslation(['settings']);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('settings:use_custom_fonts')}</Text>
      <Switch value={useCustomFonts} onValueChange={setUseCustomFonts} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
  },
});
