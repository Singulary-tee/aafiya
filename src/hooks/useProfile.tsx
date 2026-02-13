
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Profile } from '@/src/database/models/Profile';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { useDatabase } from './useDatabase';

interface ProfileContextType {
    profiles: Profile[];
    activeProfile: Profile | null;
    isLoading: boolean;
    createProfile: (profileData: Omit<Profile, 'id'>) => Promise<Profile | null>;
    switchProfile: (profileId: string) => void;
    refreshProfiles: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const { db, isLoading: isDbLoading } = useDatabase();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfiles = async () => {
        if (db) {
            const profileRepository = new ProfileRepository(db);
            const allProfiles = await profileRepository.findAll();
            setProfiles(allProfiles);
            // Logic to determine active profile, e.g., the first one or a stored preference
            if (allProfiles.length > 0) {
                // This logic might need to be more sophisticated
                if (!activeProfile || !allProfiles.some(p => p.id === activeProfile.id)) {
                    setActiveProfile(allProfiles[0]);
                }
            } else {
                setActiveProfile(null);
            }
        }
    };

    useEffect(() => {
        if (!isDbLoading) {
            setIsLoading(true);
            refreshProfiles().then(() => setIsLoading(false));
        }
    }, [db, isDbLoading]);

    const createProfile = async (profileData: Omit<Profile, 'id'>) => {
        if (db) {
            const profileRepository = new ProfileRepository(db);
            const newProfile = await profileRepository.create(profileData as Profile);
            await refreshProfiles(); // Refresh the list
            setActiveProfile(newProfile); // Set the new profile as active
            return newProfile;
        }
        return null;
    };

    const switchProfile = (profileId: string) => {
        const profileToSwitch = profiles.find(p => p.id === profileId);
        if (profileToSwitch) {
            setActiveProfile(profileToSwitch);
        }
    };

    const value = {
        profiles,
        activeProfile,
        isLoading,
        createProfile,
        switchProfile,
        refreshProfiles
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};
