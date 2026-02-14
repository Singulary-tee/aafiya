
import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/components/primitives/Text';
import { theme } from '@/src/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.subheading,
    fontWeight: 'bold',
  },
  link: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  linkText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.primary,
  },
});
