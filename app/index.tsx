
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';

export default function AppIndex() {
  const db = useDatabase();
  const [profilesExist, setProfilesExist] = useState<boolean | null>(null);

  useEffect(() => {
    if (db) {
      const checkProfiles = async () => {
        const profileRepo = new ProfileRepository(db);
        const profiles = await profileRepo.findAll();
        setProfilesExist(profiles.length > 0);
      };
      checkProfiles();
    }
  }, [db]);

  if (profilesExist === null) {
    return <ActivityIndicator />;
  }

  if (profilesExist) {
    return <Redirect href="/profiles/select" />;
  } else {
    return <Redirect href="/profiles/create" />;
  }
}
