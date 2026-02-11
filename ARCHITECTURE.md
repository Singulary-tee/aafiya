# Aafiya Medication Tracker - Modular Architecture Guide

This document outlines the modular folder structure and how to work with each layer of the application.

## Overview

The Aafiya app follows a **layered, offline-first architecture** with clear separation of concerns:

```
Presentation Layer (app/ + screens)
         ↓
Business Logic Layer (services + hooks)
         ↓
Data Layer (database + repositories)
         ↓
Local Storage (SQLite) + APIs (RxNorm, OpenFDA, DailyMed)
```

## Folder Structure

### `/app` - Expo Router Screens
**File-based routing for navigation.** Each file becomes a route.

```
app/
├── _layout.tsx              # Root layout (i18n provider, theme)
├── index.tsx                # Home screen (/)
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx            # Tab home redirect
│   ├── medications.tsx      # Medications list
│   └── settings.tsx         # Settings
├── medications/
│   ├── [id].tsx             # Medication detail
│   ├── add.tsx              # Add medication
│   └── edit/[id].tsx        # Edit medication
├── profiles/
│   ├── select.tsx           # Select profile
│   ├── create.tsx           # Create profile
│   └── edit/[id].tsx        # Edit profile
├── helper/
│   ├── index.tsx            # Helper dashboard
│   ├── pair.tsx             # QR pairing
│   └── monitor/[id].tsx     # Monitor patient
├── statistics/
│   └── [profileId].tsx      # Stats dashboard
└── +not-found.tsx           # 404 screen
```

**Guidelines:**
- Keep screens focused on UI and navigation logic
- Use custom hooks for business logic
- Pass data via route params or context
- Use `expo-router` Link for navigation

---

### `/src/components` - Reusable UI Components

Organized by feature area. Each component should be:
- **Self-contained** (manages own local state only)
- **Styled consistently** using the theme system
- **Accessible** (proper text labels, touch targets)
- **Props-based** (no direct repository access)

```
src/components/
├── common/              # Generic components
│   ├── Button.tsx       # Button variants
│   ├── Card.tsx         # Card container
│   ├── Input.tsx        # Text input
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
├── medication/          # Medication-specific
│   ├── MedicationCard.tsx
│   ├── DoseCard.tsx
│   ├── SearchBar.tsx
│   └── PillImage.tsx
├── health/              # Health visualization
│   ├── HealthCircle.tsx
│   ├── StorageCircle.tsx
│   └── HealthStats.tsx
├── profile/             # Profile management UI
│   ├── ProfileSelector.tsx
│   └── ProfileAvatar.tsx
└── helper/              # Helper mode UI
    ├── PairingQR.tsx
    └── HelperStatusCard.tsx
```

**Best Practices:**
- Import colors/spacing from `/src/constants`
- Use `useTranslation()` for i18n
- Keep props minimal and descriptive
- No business logic beyond UI state

---

### `/src/database` - Data Access Layer

Implements the **repository pattern** for clean data access.

```
src/database/
├── index.ts                     # Database initialization
├── migrations/
│   └── v1_initial.ts           # Schema creation
├── repositories/                # Data access objects
│   ├── IRepository.ts          # Interface
│   ├── ProfileRepository.ts    # CRUD for profiles
│   ├── MedicationRepository.ts # CRUD for medications
│   ├── ScheduleRepository.ts   # CRUD for schedules
│   ├── DoseLogRepository.ts    # CRUD for dose logs
│   ├── HealthMetricsRepository.ts
│   ├── ApiCacheRepository.ts
│   ├── HelperPairingRepository.ts
│   └── index.ts                # Exports
└── models/                      # TypeScript types
    ├── Profile.ts
    ├── Medication.ts
    ├── Schedule.ts
    ├── DoseLog.ts
    └── HealthMetrics.ts
```

**Repository Pattern:**
- Each entity has a repository (e.g., `MedicationRepository`)
- Repositories implement `IRepository<T, CreateInput, UpdateInput>`
- All SQL queries stay in repositories (never in components)
- Handles transactions and data consistency

**Example Usage:**
```typescript
const medicationRepo = new MedicationRepository(db);
const medication = await medicationRepo.findById('med-123');
```

---

### `/src/services` - Business Logic Layer

Business logic, external integrations, and calculations.

```
src/services/
├── api/                         # External APIs
│   ├── RxNormService.ts        # Drug info search
│   ├── DailyMedService.ts      # Pill images
│   ├── OpenFDAService.ts       # FDA data
│   ├── RateLimiter.ts
│   └── index.ts
├── notification/                # Notifications
│   ├── NotificationScheduler.ts # Schedule reminders
│   ├── NotificationHandler.ts
│   ├── MissedDoseDetector.ts   # Auto-mark missed
│   └── index.ts
├── health/                      # Health calculations
│   ├── HealthScoreCalculator.ts # Calculate 0-100 score
│   ├── StorageCalculator.ts
│   └── index.ts
├── helper/                      # Family helper mode
│   ├── HelperConnectionManager.ts
│   ├── SecureChannel.ts
│   ├── QRCodeGenerator.ts
│   └── index.ts
└── sync/                        # Data sync
    ├── DataSyncService.ts
    ├── ConflictResolver.ts
    └── index.ts
```

**Responsibilities:**
- Complex calculations (health scores, adherence %)
- Third-party API integrations (with error handling)
- Notification scheduling and background tasks
- Device communication (WiFi, Bluetooth)
- Data validation and transformation

**Example:**
```typescript
const calculator = new HealthScoreCalculator(db);
const score = await calculator.calculateProfileScore('profile-123');
```

---

### `/src/hooks` - Custom React Hooks

Application-specific hooks that wrap services and repositories.

```
src/hooks/
├── useDatabase.ts           # Initialize DB and get instance
├── useMedications.ts        # Medication CRUD + queries
├── useDoses.ts              # Dose logging operations
├── useHealthScore.ts        # Health score calculations
├── useNotifications.ts      # Notification permissions + subscriptions
├── useProfile.ts            # Profile switching, CRUD
├── useHelperMode.ts         # Helper pairing and sync
├── useNetworkStatus.ts      # Online/offline detection
└── index.ts
```

**Rules:**
- Hooks are the bridge between components and services
- Handle loading/error/success states
- Return simple, consumable data
- Use React's `useEffect` for side effects
- Implement dependency arrays correctly

**Example:**
```typescript
function useMedications(profileId: string) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const repo = new MedicationRepository(db);
      setMedications(await repo.findByProfile(profileId));
    };
    load();
  }, [profileId]);

  return { medications, loading };
}
```

---

### `/src/utils` - Utility Functions

Pure functions for common tasks (no side effects).

```
src/utils/
├── uuid.ts              # UUID generation
├── date.ts              # Date formatting, calculations
├── validation.ts        # Input validation
├── storage.ts           # AsyncStorage helpers
├── encryption.ts        # Encryption/hashing
└── logger.ts            # Debug logging
```

**Guidelines:**
- Keep functions pure (same input → same output)
- No dependencies on React or external state
- Test-friendly compositions
- Well-documented parameters

---

### `/src/constants` - Configuration & Theming

```
src/constants/
├── config.ts            # App settings, API endpoints, limits
├── colors.ts            # Color palette
├── spacing.ts           # Spacing scale (4sp base)
└── typography.ts        # Font sizes and weights
```

**Usage:**
```typescript
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants';

<View style={{ 
  padding: SPACING.lg, 
  backgroundColor: COLORS.primary 
}} />
```

---

### `/src/types` - TypeScript Definitions

Centralized type definitions.

```
src/types/
├── index.ts             # Re-exports all types
└── api.ts               # API response types
```

Plus database models in `/src/database/models/`

---

### `/src/i18n` - Internationalization

Arabic-first with English fallback.

```
src/i18n/
├── index.ts             # i18next configuration
└── locales/
    ├── ar/
    │   ├── common.json          # Basic terms
    │   ├── home.json            # Home screen
    │   ├── medications.json     # Medication terms
    │   ├── settings.json        # Settings
    │   ├── errors.json          # Error messages
    │   └── notifications.json   # Notification text
    └── en/
        └── [same structure]
```

**Features:**
- RTL-first layout for Arabic
- Device locale auto-detection
- Easy date/number localization
- No hardcoded strings in components

**Usage:**
```typescript
const { t } = useTranslation();
<Text>{t('medications.medication_name')}</Text>
```

---

## Data Flow Example

### Adding a Medication

```
Screen (add.tsx)
    ↓
Hook (useMedications.add())
    ↓
Service (validation, caching)
    ↓
Repository (MedicationRepository.create())
    ↓
Database (INSERT into medications table)
    ↓
Service (schedule notifications)
    ↓
Hook (update state, refetch)
    ↓
Screen (display success, navigate)
```

---

## Development Workflow

### 1. Creating a New Feature

1. **Define types** in `/src/database/models/` or `/src/types/`
2. **Create repository** in `/src/database/repositories/` with CRUD
3. **Create service** in `/src/services/` for business logic
4. **Create hook** in `/src/hooks/` to wrap service
5. **Create components** in `/src/components/`
6. **Create screens** in `/app/`
7. **Add translations** to i18n files

### 2. Modifying Database Schema

- Create new migration in `/src/database/migrations/`
- Update `DATABASE_CONFIG.SCHEMA_VERSION`
- Update models in `/src/database/models/`
- Update repository queries

### 3. Adding Translations

1. Add keys to all language files under `/src/i18n/locales/`
2. Use `useTranslation()` hook in components
3. Import and initialize i18n in `_layout.tsx`

---

## Best Practices

✅ **DO:**
- Keep components focused on UI
- Use hooks for state management
- Keep services pure (no side effects)
- Put SQL in repositories only
- Use TypeScript strictly
- Test-driven development
- Document complex logic

❌ **DON'T:**
- Direct API calls from components
- Complex logic in components
- Global state for everything
- Hardcoded strings
- Skip input validation
- Ignore error handling
- Mix concerns between layers

---

## Performance Tips

1. **Lazy load routes** using Expo Router
2. **Memoize expensive calculations** with useMemo
3. **Paginate large lists** (FlatList, not ScrollView)
4. **Cache API responses** in `ApiCacheRepository`
5. **Batch database queries** with transactions
6. **Debounce search inputs** to reduce queries
7. **Use React.memo** for static components

---

## Offline-First Strategy

1. **All data starts offline** in SQLite
2. **API calls are enhancements**, not blockers
3. **Queue operations** for when online
4. **Sync when possible**, but app works without connection
5. **Detect network state** with `useNetworkStatus`

---

This architecture ensures the app remains **modular, testable, and scalable** as features are added.
