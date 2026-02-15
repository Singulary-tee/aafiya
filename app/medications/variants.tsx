import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';
import PillImage from '@/src/components/medication/PillImage';
import { theme } from '@/src/constants/theme';
import { DrugConcept } from '@/src/types/api';
import { parseMedicationName, isBrandName } from '@/src/utils/medicationGrouping';
import { logger } from '@/src/utils/logger';

export default function VariantSelectionScreen() {
  const { groupName, variants: variantsParam } = useLocalSearchParams();
  const [variants, setVariants] = useState<DrugConcept[]>([]);
  const router = useRouter();
  const { t } = useTranslation(['medications']);

  useEffect(() => {
    if (variantsParam) {
      try {
        const parsedVariants = JSON.parse(variantsParam as string);
        setVariants(parsedVariants);
      } catch (error) {
        logger.error('Failed to parse variants:', error);
      }
    }
  }, [variantsParam]);

  const handleSelectVariant = (variant: DrugConcept) => {
    // Navigate back to add screen with selected drug as URL parameter
    router.replace({
      pathname: '/medications/add',
      params: {
        selectedRxcui: variant.rxcui,
        selectedName: variant.name,
      }
    });
  };

  const renderVariant = ({ item }: { item: DrugConcept }) => {
    const parsed = parseMedicationName(item.name);
    const isGeneric = !isBrandName(item.name);

    return (
      <View style={styles.variantCard}>
        <View style={styles.variantHeader}>
          <PillImage size={60} />
          <View style={styles.variantInfo}>
            <Text size="body" weight="bold" numberOfLines={2}>
              {item.name}
            </Text>
            {parsed.form && (
              <Text size="small" style={styles.secondaryText}>
                {t('form')}: {parsed.form}
              </Text>
            )}
            {parsed.strength && (
              <Text size="small" style={styles.secondaryText}>
                {t('strength')}: {parsed.strength}
              </Text>
            )}
            {isGeneric ? (
              <View style={styles.badge}>
                <Text size="small" style={styles.badgeText}>Generic</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.brandBadge]}>
                <Text size="small" style={styles.badgeText}>Brand</Text>
              </View>
            )}
          </View>
        </View>
        <Button
          title={t('select_this_form')}
          onPress={() => handleSelectVariant(item)}
          style={styles.selectButton}
        />
      </View>
    );
  };

  if (variants.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text size="title" weight="bold">
          {t('select_form_title', { name: groupName })}
        </Text>
      </View>
      <FlatList
        data={variants}
        renderItem={renderVariant}
        keyExtractor={(item) => item.rxcui}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  variantCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  variantHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  variantInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  secondaryText: {
    color: theme.colors.textSecondary,
  },
  badge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radii.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  brandBadge: {
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  selectButton: {
    marginTop: theme.spacing.sm,
  },
});
