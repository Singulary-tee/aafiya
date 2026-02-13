import { useDatabase } from "./useDatabase";
import { ProfileRepository } from "../database/repositories/ProfileRepository";
import { Profile } from "../database/models/Profile";
import { useState, useEffect, useCallback } from "react";

/**
 * useProfile
 * A hook for managing user profiles.
 */
export function useProfile() {
    const db = useDatabase();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

    const profileRepository = db ? new ProfileRepository(db) : null;

    const loadProfiles = useCallback(async () => {
        if (profileRepository) {
            const allProfiles = await profileRepository.findAll();
            setProfiles(allProfiles);
            if (allProfiles.length > 0 && !activeProfile) {
                // Set the first profile as active by default
                setActiveProfile(allProfiles[0]);
            }
        }
    }, [profileRepository, activeProfile]);

    useEffect(() => {
        loadProfiles();
    }, [loadProfiles]);

    const createProfile = async (profile: Omit<Profile, 'id'>) => {
        if (profileRepository) {
            const newProfile = await profileRepository.create(profile as Profile);
            loadProfiles();
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

    return { profiles, activeProfile, createProfile, switchProfile };
}
