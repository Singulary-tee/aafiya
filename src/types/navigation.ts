/**
 * This file contains TypeScript types for navigation using Expo Router.
 * These types help ensure that navigation parameters are strongly typed
 * across the application, especially when using dynamic routes.
 */

// Since Expo Router uses file-based routing, we define the parameters
// for our dynamic routes. These can be used with the `useLocalSearchParams` hook.

/**
 * Type for parameters passed to the Medication Detail screen (`/medications/[id].tsx`).
 */
export type MedicationDetailParams = {
  id: string;
};

/**
 * Type for parameters passed to the Edit Medication screen (`/medications/edit/[id].tsx`).
 */
export type EditMedicationParams = {
  id: string;
};

/**
 * Type for parameters passed to the Edit Profile screen (`/profiles/edit/[id].tsx`).
 */
export type EditProfileParams = {
  id: string;
};

/**
 * Type for parameters passed to the Monitor Helper screen (`/helper/monitor/[id].tsx`).
 */
export type MonitorHelperParams = {
  id: string;
};

/**
 * Type for parameters passed to the Statistics screen (`/statistics/[profileId].tsx`).
 */
export type StatisticsParams = {
  profileId: string;
};
