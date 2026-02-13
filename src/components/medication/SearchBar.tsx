
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONT_SIZES } from '../../constants/typography';
// You might need to install this or use another icon library
import { Ionicons } from '@expo/vector-icons'; 

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const { t } = useTranslation('medications');
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={t('search_placeholder')}
        placeholderTextColor={COLORS.textSecondary}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => onSearch(query)}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={() => setQuery('')}>
          <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
  },
});

export default SearchBar;
