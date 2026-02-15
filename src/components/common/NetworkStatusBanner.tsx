import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../primitives/Text';
import { theme } from '../../constants/theme';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface NetworkStatusBannerProps {
  showWhenOnline?: boolean;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  showWhenOnline = false,
}) => {
  const isOnline = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Track if we were offline
    if (!isOnline) {
      setWasOffline(true);
      setDismissed(false);
    }

    // Show banner when offline or when coming back online (if showWhenOnline is true)
    if (!isOnline || (showWhenOnline && wasOffline && isOnline)) {
      setDismissed(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isOnline && wasOffline && !showWhenOnline) {
      // Auto-dismiss when connection restored
      setTimeout(() => {
        handleDismiss();
      }, 3000);
    }
  }, [isOnline, wasOffline, showWhenOnline]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
      if (isOnline) {
        setWasOffline(false);
      }
    });
  };

  if (dismissed || (isOnline && !wasOffline)) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isOnline ? styles.online : styles.offline,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOnline ? 'checkmark-circle' : 'warning'}
          size={20}
          color={isOnline ? theme.colors.success : theme.colors.warning}
          style={styles.icon}
        />
        <Text size="small" weight="medium" style={styles.text}>
          {isOnline ? '✓ Connection restored' : '⚠️ Offline - Using cached data'}
        </Text>
      </View>
      <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
        <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  offline: {
    backgroundColor: theme.colors.warning + '20',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.warning,
  },
  online: {
    backgroundColor: theme.colors.success + '20',
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.success,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    color: theme.colors.textPrimary,
    flex: 1,
  },
  dismissButton: {
    padding: theme.spacing.xs,
  },
});

export default NetworkStatusBanner;
