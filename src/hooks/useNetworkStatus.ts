import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * useNetworkStatus
 * A hook to get the network status of the device.
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected != null && state.isConnected);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return isOnline;
}
