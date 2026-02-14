# Comprehensive Technical Specification: Arabic Medication Tracking Application

**Document Version:** 1.0  
**Last Updated:** February 11, 2026  
**Development Platform:** React Native + Expo  
**Primary Language:** Arabic  
**Target Platform:** Android (iOS possible future extension)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Requirements](#core-requirements)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Architecture](#database-architecture)
6. [API Integration Strategy](#api-integration-strategy)
7. [Feature Specifications](#feature-specifications)
8. [Internationalization & RTL](#internationalization--rtl)
9. [Notification System](#notification-system)
10. [Family Helper Mode](#family-helper-mode)
11. [UI/UX Design Requirements](#uiux-design-requirements)
12. [File Structure](#file-structure)
13. [Development Workflow](#development-workflow)
14. [Boundaries & Constraints](#boundaries--constraints)
15. [Invariants](#invariants)
16. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
17. [Testing Strategy](#testing-strategy)
18. [Deployment Considerations](#deployment-considerations)

---

## Project Overview

### Vision
Create a privacy-first, offline-capable medication tracking application for Arabic-speaking users that gamifies medication adherence while maintaining complete user data privacy. The app operates entirely offline with optional online features limited to downloading medication information.

### Key Differentiators
- **Complete offline operation** - No cloud dependency for core functionality
- **Privacy-first architecture** - User data never leaves device except via local WiFi sync
- **Arabic-native design** - RTL-first UI with proper Arabic typography
- **Gamified adherence** - Visual health indicators encourage consistent medication taking
- **Family support** - Local WiFi-based helper notifications without cloud intermediary

### Target Users
- **Primary:** Arabic-speaking patients managing chronic medication regimens
- **Secondary:** Family members/caregivers monitoring patient adherence
- **Demographics:** All ages, focus on users requiring multi-medication management

---

## Core Requirements

### Functional Requirements

#### Must Have (MVP)
1. **Medication Management**
   - Add medications with name, dosage, frequency
   - Edit medication details
   - Delete medications
   - Track current pill count (storage indicator)
   - Manual refill count updates

2. **Dose Logging**
   - One-tap dose confirmation
   - Automatic missed dose detection after grace period
   - Optional skip action (less penalty than missed)
   - Optional notes on individual doses

3. **Reminder System**
   - Schedule notifications at specific times
   - Support multiple doses per day
   - Custom grace periods (default 30 minutes)
   - Persistent notifications across device reboots
   - Custom notification sounds per medication

4. **Gamification**
   - Health circle indicator (0-100%)
   - Storage circles per medication (days remaining)
   - Visual degradation on missed/late doses
   - Gradual recovery with adherence

5. **Profile Management**
   - Multiple user profiles (family mode)
   - Profile-specific data isolation
   - Simple profile switching (no authentication)

6. **Medication Database**
   - User-initiated download of medication info
   - Pill images from DailyMed
   - Basic medication details (name, forms, strength)
   - Offline-first caching

#### Should Have (Post-MVP)
1. **Family Helper Mode**
   - QR code pairing between devices
   - WiFi Direct local sync
   - Notification to helpers on missed doses
   - Read-only helper access
   - Health score sync

2. **Statistics Dashboard**
   - Adherence percentage
   - Streak tracking
   - Missed dose history
   - Visual charts (optional)

3. **Export Functionality**
   - Export dose logs as CSV
   - Share with healthcare providers
   - No cloud upload required

#### Won't Have (Explicitly Excluded)
1. Cloud synchronization
2. User accounts/authentication
3. Drug interaction checking (requires paid API)
4. Automatic refill reminders via pharmacy integration
5. Telemedicine integration
6. Push notifications (only local notifications)
7. Social sharing features
8. In-app purchases/subscriptions

### Non-Functional Requirements

#### Performance
- App launch time: <2 seconds
- Database query response: <50ms
- Notification delivery: 100% reliable within 1-minute window
- Search results: <200ms for local database

#### Offline Capability
- 100% functional offline after initial medication database download
- No network required for dose logging, reminders, statistics
- Graceful handling of failed network requests
- Queue system for optional online features

#### Data Privacy
- Zero telemetry/analytics
- No crash reporting to external services
- No advertising SDKs
- All data stored locally in SQLite
- Only request permissions required for core features:
  - Notifications (reminders)
  - Exact alarms on Android 12+ (reliable scheduling)
  - Camera access for helper-mode QR pairing
  - Storage access for local images and exports

#### Accessibility
- Full screen reader support
- Large text mode compatibility
- High contrast mode support
- Minimum touch target: 44x44dp

#### Localization
- Arabic primary language
- RTL layout throughout
- Proper Arabic date/time formatting
- Number formatting (Eastern Arabic numerals option)

---

## System Architecture

### Architectural Pattern
**Offline-First Event-Driven Architecture**

The application follows a strict offline-first approach where all core functionality operates without network connectivity. Network requests are enhancement-only operations that never block critical user flows.

### Core Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (Expo Router screens, React components, UI state)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  (Hooks, Services, Schedulers, Calculators)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  (Repository Pattern, SQLite, API Services)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────┐  ┌────────────────────────┐
│   Local Storage       │  │   Remote APIs          │
│   (SQLite + Images)   │  │   (RxNorm, OpenFDA)    │
└───────────────────────┘  └────────────────────────┘
```

### Data Flow

#### Medication Addition Flow
```
User Input → Search Local DB → Not Found? →
Offline? → Manual entry + Save to SQLite (option to enrich later)
Online? → Search RxNorm API → Cache Result → Display → User Confirms →
Save to SQLite → Schedule Notifications → Update UI
```

#### Dose Logging Flow
```
User Taps "Taken" → Update dose_log Table → Decrement pill count 
→ Recalculate Health Score → Update UI → Cancel Notification 
→ Persist Changes
```

#### Missed Dose Detection Flow
```
Scheduled Time + Grace Period Passes → Background Check 
→ No Dose Logged? → Mark as Missed → Update Health Score 
→ Trigger Helper Notification (if enabled) → Update UI
```

---

## Technology Stack

### Core Framework
**React Native via Expo SDK 54+**
- Framework: React Native 0.81+
- Platform: Expo managed workflow
- Development: Expo Go for development, Development Build for production features
- Justification: Only viable option for hot-reload development on Android device via Firebase Studio (Google IDX)

### Navigation
**Expo Router (NOT React Navigation)**
- Version: Latest stable in Expo SDK 54+
- Type: File-based routing
- Features: Automatic deep linking, typed routes, lazy loading
- Critical Correction: Uses Expo Router, not standalone React Navigation

### Database
**expo-sqlite**
- Version: Bundled with Expo SDK 54+
- API Style: Async/await with SQLite.openDatabaseAsync()
- Features: 
  - Full SQL support
  - Transactions
  - Prepared statements (SQL injection protection)
  - Synchronous APIs via expo-sqlite/kv-store
  - Optional localStorage API compatibility
- Size: Negligible (native SQLite)

### Local Notifications
**expo-notifications**
- Version: Latest in Expo SDK 54+
- Capabilities:
  - Schedule repeating notifications
  - Calendar-based triggers (specific times)
  - Notification channels (Android)
  - Custom sounds
  - Badge numbers
  - Foreground/background handling
- Android 12+ Requirement: SCHEDULE_EXACT_ALARM permission (handled via config plugin)

### Internationalization
**i18next + react-i18next + expo-localization**
- i18next: Core translation engine
- react-i18next: React bindings, useTranslation hook
- expo-localization: Device locale detection
- RTL Support: React Native I18nManager
- Persistence: AsyncStorage or expo-secure-store

### HTTP Client
**axios**
- Version: 1.6+
- Features:
  - Interceptors for rate limiting
  - Request/response transformation
  - Timeout handling
  - Automatic JSON parsing
- Alternative: Expo's fetch (built-in, lighter weight)

### State Management
**React Context API + useState**
- Global State: React Context for active medications, current profile
- Local State: Component-level useState for screens
- Justification: App complexity doesn't warrant Redux/Zustand
- Future: Consider Zustand if state management becomes complex

### UI Components
**React Native core components + Custom components**
- Base: View, Text, TouchableOpacity, ScrollView, FlatList
- Icons: @expo/vector-icons (Material Icons, Ionicons)
- Graphics: react-native-svg for health circles
- Images: expo-image for caching pill images
- No UI library: Custom components for full design control

### Date/Time Manipulation
**date-fns**
- Version: 3.0+
- Features: Immutable, tree-shakeable, i18n support
- Use cases: Schedule calculations, date formatting, relative times
- Alternative: Day.js (smaller bundle)

### Storage
**expo-secure-store (sensitive data) + AsyncStorage (preferences)**
- expo-secure-store: Encrypted storage for helper pairing keys
- AsyncStorage: Language preference, onboarding state
- SQLite: All medication and dose data

### QR Code
**expo-barcode-scanner (scanning) + react-native-qrcode-svg (generation)**
- expo-barcode-scanner: Scan QR codes for helper pairing
- react-native-qrcode-svg: Generate pairing QR codes
- Permissions: Camera access required

### WiFi Direct / Local Network
**Custom implementation using:**
- react-native-zeroconf: mDNS service discovery
- WebSocket or direct TCP: Encrypted communication
- Crypto: expo-crypto for encryption keys
- Note: Requires Development Build (not available in Expo Go)

### Development Tools
**Firebase Studio (Google IDX)**
- Cloud-based IDE with Expo support
- Android emulator embedded
- Hot reload via Expo Go
- Bandwidth considerations: Disable live preview when editing non-UI code

### Build & Deployment
**EAS Build (Expo Application Services)**
- Development builds for WiFi Direct testing
- Production APK generation
- Free tier limitations: Monitor monthly build quota
- Alternative: Local builds via expo prebuild (requires Android Studio)

---

## Database Architecture

### Database Name
`medication_tracker.db`

### Schema Version
1.0 (include migration strategy for future updates)

### Tables

#### 1. profiles
Stores user profiles for multi-user family mode.

```sql
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,  -- UUID v4
    name TEXT NOT NULL,
    avatar_color TEXT NOT NULL,  -- Hex color code
    created_at INTEGER NOT NULL,  -- Unix timestamp
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_profiles_created ON profiles(created_at);
```

**Constraints:**
- name: 1-50 characters, Arabic or English
- avatar_color: Valid hex color (#RRGGBB)

#### 2. medications
Stores medication information per profile.

```sql
CREATE TABLE medications (
    id TEXT PRIMARY KEY,  -- UUID v4
    profile_id TEXT NOT NULL,
    rxcui TEXT,  -- RxNorm Concept Unique Identifier (optional)
    name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    dosage_form TEXT,  -- e.g., "tablet", "capsule"
    strength TEXT,  -- e.g., "500mg"
    initial_count INTEGER NOT NULL,  -- Starting pill count
    current_count INTEGER NOT NULL,  -- Remaining pills
    image_url TEXT,  -- Local file path or DailyMed URL
    notes TEXT,
    is_active INTEGER DEFAULT 1,  -- Boolean: 1=active, 0=archived
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_medications_profile ON medications(profile_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_medications_rxcui ON medications(rxcui);
```

**Constraints:**
- name: Required, 1-200 characters
- initial_count: >= 0
- current_count: >= 0, <= initial_count

#### 3. schedules
Stores dosing schedules for medications.

```sql
CREATE TABLE schedules (
    id TEXT PRIMARY KEY,  -- UUID v4
    medication_id TEXT NOT NULL,
    times TEXT NOT NULL,  -- JSON array of time strings ["09:00", "21:00"]
    days_of_week TEXT,  -- JSON array [0,1,2,3,4,5,6] or null for daily
    grace_period_minutes INTEGER DEFAULT 30,
    notification_sound TEXT,  -- Sound file name or null for default
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
);

CREATE INDEX idx_schedules_medication ON schedules(medication_id);
CREATE INDEX idx_schedules_active ON schedules(is_active);
```

**Constraints:**
- times: Valid JSON array of HH:MM strings
- days_of_week: Null or JSON array of integers 0-6
- grace_period_minutes: 5-120

#### 4. dose_log
Records all dose events (taken, missed, skipped).

```sql
CREATE TABLE dose_log (
    id TEXT PRIMARY KEY,  -- UUID v4
    medication_id TEXT NOT NULL,
    schedule_id TEXT NOT NULL,
    scheduled_time INTEGER NOT NULL,  -- Unix timestamp
    actual_time INTEGER,  -- Unix timestamp or null if missed
    status TEXT NOT NULL,  -- 'taken', 'missed', 'skipped'
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
);

CREATE INDEX idx_dose_log_medication ON dose_log(medication_id);
CREATE INDEX idx_dose_log_scheduled_time ON dose_log(scheduled_time);
CREATE INDEX idx_dose_log_status ON dose_log(status);
CREATE INDEX idx_dose_log_created ON dose_log(created_at);
```

**Constraints:**
- status: Must be 'taken', 'missed', or 'skipped'
- actual_time: Required if status='taken', null otherwise

#### 5. health_metrics
Cached health score calculations per profile.

```sql
CREATE TABLE health_metrics (
    profile_id TEXT PRIMARY KEY,
    health_score REAL NOT NULL DEFAULT 100.0,  -- 0.0 to 100.0
    last_calculated INTEGER NOT NULL,  -- Unix timestamp
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
```

**Constraints:**
- health_score: 0.0 <= score <= 100.0

#### 6. api_cache
Caches medication search results from RxNorm/OpenFDA.

```sql
CREATE TABLE api_cache (
    id TEXT PRIMARY KEY,  -- UUID v4
    query TEXT NOT NULL,  -- Search query
    source TEXT NOT NULL,  -- 'rxnorm', 'openfda', 'dailymed'
    response_data TEXT NOT NULL,  -- JSON response
    cached_at INTEGER NOT NULL,  -- Unix timestamp
    expires_at INTEGER NOT NULL  -- Unix timestamp (30 days default)
);

CREATE INDEX idx_api_cache_query ON api_cache(query, source);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
```

**Cache Invalidation:**
- Expire after 30 days
- Periodic cleanup of expired entries

#### 7. helper_pairings
Stores WiFi Direct helper device pairings.

```sql
CREATE TABLE helper_pairings (
    id TEXT PRIMARY KEY,  -- UUID v4
    profile_id TEXT NOT NULL,
    helper_device_id TEXT NOT NULL,  -- Helper's unique identifier
    encryption_key TEXT NOT NULL,  -- Base64 encoded key
    paired_at INTEGER NOT NULL,
    last_sync INTEGER,  -- Unix timestamp of last successful sync
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_helper_pairings_profile ON helper_pairings(profile_id);
CREATE INDEX idx_helper_pairings_device ON helper_pairings(helper_device_id);
```

### Database Initialization

```javascript
// Example initialization code
import * as SQLite from 'expo-sqlite';

const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('medication_tracker.db');
  
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');
  
  // Create tables (use actual CREATE TABLE statements from above)
  await db.execAsync(`
    -- Insert all CREATE TABLE statements here
  `);
  
  return db;
};
```

### Migration Strategy

Use version tracking table:

```sql
CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
);

INSERT INTO schema_version (version, applied_at) 
VALUES (1, strftime('%s', 'now'));
```

---

## API Integration Strategy

### Available APIs

#### 1. RxNorm API (National Library of Medicine)
**Base URL:** `https://rxnav.nlm.nih.gov/REST/`

**Purpose:** Medication name normalization and basic information

**Rate Limit:** 20 requests per second per IP address

**Authentication:** None required

**Key Endpoints:**
```
GET /drugs.json?name={searchTerm}
  - Returns matching medications with RxCUI

GET /rxcui/{rxcui}/properties.json
  - Returns detailed drug properties

GET /rxcui/{rxcui}/related.json?tty={termType}
  - Returns related concepts (generic, brand, etc.)
```

**Response Example:**
```json
{
  "drugGroup": {
    "conceptGroup": [
      {
        "tty": "SCD",
        "conceptProperties": [
          {
            "rxcui": "198013",
            "name": "Naproxen 250 MG Oral Tablet",
            "synonym": "Naproxen Tab 250 MG"
          }
        ]
      }
    ]
  }
}
```

**Implementation Notes:**
- Filter results by term type (SCD, SBD for clinical drugs)
- Cache all responses locally
- Implement rate limiter at 15 req/sec (safety margin)

#### 2. OpenFDA API
**Base URL:** `https://api.fda.gov/`

**Purpose:** Official FDA labeling information

**Rate Limits:**
- Without API key: 40 req/min, 1000 req/day per IP
- With API key: 240 req/min, 120,000 req/day

**Authentication:** Optional API key (free registration)

**Key Endpoints:**
```
GET /drug/label.json?search=openfda.brand_name:"{brandName}"
  - Returns FDA drug labels

GET /drug/ndc.json?search=product_ndc:"{ndc}"
  - Returns NDC directory info
```

**Implementation Notes:**
- Register for free API key at https://open.fda.gov/apis/authentication/
- Include API key in all requests
- Use for supplementary information, not primary search

#### 3. DailyMed API (NLM)
**Base URL:** `https://dailymed.nlm.nih.gov/dailymed/services/v2/`

**Purpose:** Pill images and structured product labels

**Rate Limit:** Not explicitly documented, use conservative throttling

**Authentication:** None required

**Key Endpoints:**
```
GET /spls.json?drug_name={name}
  - Returns Set ID for drug

GET /spls/{setid}/media.json
  - Returns pill images
```

**Implementation Notes:**
- Primary source for pill images
- Images returned as URLs, download and cache locally
- Fallback to placeholder if no image available

### API Service Architecture

#### Rate Limiting Implementation

```javascript
class RateLimiter {
  constructor(requestsPerSecond) {
    this.requestsPerSecond = requestsPerSecond;
    this.queue = [];
    this.processing = false;
  }

  async executeRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const { requestFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    }
    
    const delay = 1000 / this.requestsPerSecond;
    setTimeout(() => {
      this.processing = false;
      this.processQueue();
    }, delay);
  }
}

// Usage
const rxNormLimiter = new RateLimiter(15); // 15 req/sec
const openFDALimiter = new RateLimiter(3);  // 180 req/min = 3 req/sec
```

#### API Service Module

```javascript
// src/services/api/rxnorm.service.ts
import axios from 'axios';

const BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export const searchMedications = async (query: string) => {
  const response = await axios.get(`${BASE_URL}/drugs.json`, {
    params: { name: query },
    timeout: 10000
  });
  
  // Parse and filter relevant results
  return parseMedicationResults(response.data);
};

// Helper to parse API response
const parseMedicationResults = (data) => {
  const groups = data.drugGroup?.conceptGroup || [];
  const relevant = groups.filter(g => 
    ['SCD', 'SBD', 'GPCK', 'BPCK'].includes(g.tty)
  );
  
  return relevant.flatMap(group => 
    group.conceptProperties?.map(prop => ({
      rxcui: prop.rxcui,
      name: prop.name,
      synonym: prop.synonym
    })) || []
  );
};
```

### Caching Strategy

1. **Search Results:** Cache for 30 days
2. **Medication Details:** Cache permanently (rarely change)
3. **Pill Images:** Download once, store in device storage
4. **Cache Invalidation:** Manual refresh option in settings

### Network Error Handling

```javascript
const fetchWithFallback = async (apiFn, cacheKey) => {
  try {
    const result = await apiFn();
    await saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    if (!navigator.onLine) {
      // Return cached version if offline
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;
    }
    throw new Error('Network error and no cached data available');
  }
};
```

### Attribution Requirements

Per NLM Terms of Service, include in app's About/Credits screen:

```
"This product uses publicly available data from the U.S. National Library 
of Medicine (NLM), National Institutes of Health, Department of Health and 
Human Services; NLM is not responsible for the product and does not endorse 
or recommend this or any other product."
```

---

## Feature Specifications

### 1. Medication Search & Addition

#### User Flow
1. User navigates to "Add Medication" screen
2. User enters medication name in search field (Arabic or English)
3. App searches local database first (instant results)
4. If no local results and online, queries RxNorm API
5. Displays results with pill images (if available)
6. User selects medication from results
7. User enters additional details:
   - Initial pill count
   - Schedule (times per day, specific times)
   - Grace period for reminders
8. App schedules notifications
9. Medication added to active list

#### Technical Implementation

**Search Debouncing:** 300ms delay after last keystroke

**Search Priority:**
1. Exact matches in local DB
2. Partial matches in local DB (starts with query)
3. RxNorm API results (if online)

**Pill Image Loading:**
- Fetch from DailyMed API using rxcui
- Cache image file locally in app documents directory
- Display placeholder during download
- Graceful fallback if image unavailable

#### Edge Cases
- No network connection: Show only local results with explanation
- API timeout: Fallback to cached data, show error message
- No results found: Allow manual entry of medication name
- Duplicate medication: Warn user before adding

### 2. Dose Logging

#### Quick Log (Primary Method)
- **Location:** Today's dose list on home screen
- **Action:** Single tap on "Take" button
- **Result:** 
  - Immediately marks dose as taken at current time
  - Decrements pill count by 1
  - Updates health score (+2%)
  - Dismisses scheduled notification
  - Shows brief confirmation animation

#### Skip vs. Miss
**Skip (Manual):**
- User taps "Skip" button
- Status: skipped
- Health penalty: -3%
- Use case: Intentionally not taking dose (doctor's orders, side effects)

**Miss (Automatic):**
- Scheduled time + grace period elapses
- No user action
- Status: missed
- Health penalty: -10%
- Triggers helper notification (if enabled)

#### Late Dose
- Taken after scheduled time but within grace period
- Status: taken
- Health penalty: -3%
- actual_time recorded (for statistics)

#### Optional Notes
- Tap dose entry to add notes
- Use cases: Side effects, forgot reason, etc.
- Displayed in dose history

### 3. Health Circle Gamification

#### Health Score Calculation

**Formula:**
```
Initial Score: 100%

On Perfect Dose (within scheduled window):
  score += 2%  (capped at 100%)

On Late Dose (within grace period):
  score -= 3%

On Skipped Dose:
  score -= 3%

On Missed Dose:
  score -= 10%

Minimum Score: 0%
```

**Persistence:**
- Recalculated on every dose event
- Cached in health_metrics table
- Updated in real-time on UI

#### Visual Representation

**Circle States:**
- **100-75%:** Green, "Healthy" label
- **74-50%:** Yellow, "Needs Attention" label
- **49-25%:** Orange, "At Risk" label
- **24-0%:** Red, "Critical" label

**Animation:**
- Smooth color transition on score change
- Pulsing effect on dose logging
- Gentle degradation animation on missed dose

#### Streak Tracking (Optional Enhancement)
- Count consecutive days with all doses taken
- Reset on any missed dose
- Display milestone badges (7, 30, 90 days)

### 4. Storage Indicators

#### Per-Medication Circle

**Display:**
- Small circle next to medication name
- Shows days remaining based on current count and schedule
- Color coding:
  - Green: 14+ days
  - Yellow: 7-13 days
  - Red: <7 days
  - Gray: 0 days (refill needed)

**Calculation:**
```javascript
daysRemaining = Math.floor(
  currentCount / (timesPerDay * activeDaysPerWeek / 7)
);
```

**Refill Flow:**
1. User taps storage circle or medication details
2. Displays current count and days remaining
3. User enters refill amount
4. currentCount += refillAmount
5. Circle updates color instantly

#### Low Supply Notification
- Optional feature: Notify when <7 days remaining
- Configurable threshold in settings
- One-time notification (don't spam)

### 5. Multiple Profiles (Family Mode)

#### Profile Management

**Creation:**
- Name (required, 1-50 characters)
- Avatar color (select from preset palette)
- No password or authentication

**Switching:**
- Profile selector at top of home screen
- Dropdown or horizontal scrollable list
- Instant switch (no confirmation needed)

**Data Isolation:**
- All medications, schedules, doses specific to profile
- Health score independent per profile
- No cross-profile data access

#### Use Cases
- Parent tracking multiple children's medications
- Caregiver managing elderly patient
- Individual tracking multiple family members

#### UI Considerations
- Clear visual indicator of active profile (color band at top)
- Profile name visible on all screens
- Quick-switch gesture (swipe on profile bar)

---

## Internationalization & RTL

### Language Support

**Primary Language:** Arabic (ar-SA, Saudi dialect)
**Fallback Language:** English (en-US)

### i18n Setup

#### Directory Structure
```
/src/i18n/
  ├── index.ts          # i18n configuration
  ├── resources.ts      # Language resource imports
  └── locales/
      ├── ar/
      │   ├── common.json
      │   ├── home.json
      │   ├── medications.json
      │   └── settings.json
      └── en/
          ├── common.json
          ├── home.json
          ├── medications.json
          └── settings.json
```

#### Configuration (src/i18n/index.ts)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import resources from './resources';

const STORAGE_KEY = 'app_language';

// Get device language or saved preference
const getInitialLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    
    const deviceLocale = getLocales()[0].languageCode;
    return deviceLocale === 'ar' ? 'ar' : 'en';
  } catch {
    return 'ar'; // Default to Arabic
  }
};

const initializeI18n = async () => {
  const language = await getInitialLanguage();
  const isRTL = language === 'ar';
  
  // Set RTL before i18n initialization
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    // Note: RTL change requires app reload on native
  }
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });
};

// Language change handler
export const changeLanguage = async (newLang: 'ar' | 'en') => {
  const currentIsRTL = i18n.language === 'ar';
  const newIsRTL = newLang === 'ar';
  
  await i18n.changeLanguage(newLang);
  await AsyncStorage.setItem(STORAGE_KEY, newLang);
  
  // Reload app if RTL direction changes
  if (currentIsRTL !== newIsRTL) {
    I18nManager.forceRTL(newIsRTL);
    await Updates.reloadAsync();
  }
};

initializeI18n();

export default i18n;
```

### RTL Layout Considerations

#### Styling Guidelines

**Use Start/End Instead of Left/Right:**
```javascript
// ❌ Wrong
style={{ paddingLeft: 20, marginRight: 10 }}

// ✅ Correct
style={{ paddingStart: 20, marginEnd: 10 }}
```

**Directional Icons:**
```javascript
import { I18nManager } from 'react-native';

const ArrowIcon = () => {
  const isRTL = I18nManager.isRTL;
  return (
    <Icon 
      name={isRTL ? 'arrow-left' : 'arrow-right'} 
      size={24} 
    />
  );
};
```

**FlexBox Direction:**
- `flexDirection: 'row'` automatically reverses in RTL
- Use `flexDirection: 'row-reverse'` only for exceptions

#### Text Alignment
```javascript
// Let React Native handle automatic alignment
<Text>{t('welcome')}</Text>

// Force specific alignment only when necessary
<Text style={{ textAlign: 'center' }}>{t('title')}</Text>
```

#### Date/Time Formatting

Use Intl API for locale-aware formatting:

```javascript
import { getLocales } from 'expo-localization';

const formatDate = (date: Date) => {
  const locale = getLocales()[0].languageTag; // 'ar-SA' or 'en-US'
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const formatTime = (date: Date) => {
  const locale = getLocales()[0].languageTag;
  
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale.startsWith('en')
  }).format(date);
};
```

#### Number Formatting

**Eastern Arabic Numerals Option:**

```javascript
const formatNumber = (num: number, useEasternArabic: boolean) => {
  if (!useEasternArabic) return num.toString();
  
  const easternNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return num.toString().split('').map(d => 
    isNaN(d) ? d : easternNumerals[parseInt(d)]
  ).join('');
};
```

### Translation File Structure

#### Example: ar/common.json
```json
{
  "app_name": "متتبع الدواء",
  "buttons": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة"
  },
  "time": {
    "morning": "صباحاً",
    "afternoon": "بعد الظهر",
    "evening": "مساءً",
    "night": "ليلاً"
  },
  "status": {
    "taken": "تم الأخذ",
    "missed": "فائت",
    "skipped": "متخطى"
  }
}
```

#### Example: ar/medications.json
```json
{
  "search_placeholder": "ابحث عن دواء...",
  "add_medication": "إضافة دواء",
  "medication_details": "تفاصيل الدواء",
  "dosage": "الجرعة",
  "frequency": "التكرار",
  "times_per_day": "{{count}} مرة في اليوم",
  "pill_count": "عدد الحبوب",
  "refill": "إعادة تعبئة"
}
```

### Plural Forms

Arabic has 6 plural forms. Use i18next pluralization:

```json
{
  "pills_count_zero": "لا توجد حبوب",
  "pills_count_one": "حبة واحدة",
  "pills_count_two": "حبتان",
  "pills_count_few": "{{count}} حبات",
  "pills_count_many": "{{count}} حبة",
  "pills_count_other": "{{count}} حبة"
}
```

Usage:
```javascript
const { t } = useTranslation();
<Text>{t('pills_count', { count: pillCount })}</Text>
```

---

## Notification System

### Architecture

**Type:** Local Notifications (not push notifications)
**Library:** expo-notifications
**Permissions:** SCHEDULE_EXACT_ALARM (Android 12+)

### Notification Configuration

#### App Config (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4CAF50",
          "sounds": [
            "./assets/sounds/pill-reminder.wav"
          ]
        }
      ]
    ],
    "android": {
      "permissions": [
        "SCHEDULE_EXACT_ALARM",
        "POST_NOTIFICATIONS"
      ]
    }
  }
}
```

### Permission Request

```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    console.warn('Notifications only work on physical devices');
    return false;
  }
  
  const { status: existingStatus } = 
    await Notifications.getPermissionsAsync();
  
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Notification permissions are required for medication reminders');
    return false;
  }
  
  return true;
};
```

### Notification Handler

```javascript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

### Scheduling Notifications

#### Daily Recurring Notification

```javascript
const scheduleMedicationNotification = async (medication, schedule) => {
  const triggers = [];
  
  for (const time of schedule.times) {
    const [hour, minute] = time.split(':').map(Number);
    
    // Create trigger for each day
    const daysOfWeek = schedule.days_of_week || [0,1,2,3,4,5,6];
    
    for (const day of daysOfWeek) {
      const trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        repeats: true,
        weekday: day + 1, // iOS uses 1-7, Android uses 1-7
        hour,
        minute
      };
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${medication.name} - ${schedule.dosage}`,
          body: `وقت تناول الدواء (${time})`,
          sound: schedule.notification_sound || 'default',
          data: {
            medicationId: medication.id,
            scheduleId: schedule.id,
            scheduledTime: `${hour}:${minute}`
          }
        },
        trigger
      });
      
      // Store notification ID for later cancellation
      triggers.push({ notificationId, day, time });
    }
  }
  
  return triggers;
};
```

#### Android Notification Channels

```javascript
const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-reminders', {
      name: 'Medication Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4CAF50',
      sound: 'pill-reminder.wav'
    });
  }
};
```

### Notification Response Handling

```javascript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const useNotificationResponse = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Handle notification tap when app is foreground or background
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { medicationId } = response.notification.request.content.data;
        
        // Navigate to medication detail screen
        router.push(`/medications/${medicationId}`);
      }
    );
    
    return () => subscription.remove();
  }, []);
};
```

### Canceling Notifications

```javascript
const cancelMedicationNotifications = async (medicationId) => {
  // Get all scheduled notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  
  // Filter by medication ID
  const toCancel = scheduled.filter(notification => 
    notification.content.data?.medicationId === medicationId
  );
  
  // Cancel each
  for (const notification of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(
      notification.identifier
    );
  }
};
```

### Grace Period Implementation

**Approach:** Use background task to check for missed doses

```javascript
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const MISSED_DOSE_CHECK_TASK = 'missed-dose-check';

TaskManager.defineTask(MISSED_DOSE_CHECK_TASK, async () => {
  try {
    const now = Date.now();
    
    // Query database for doses that should have been taken
    const overdueDoses = await getDosesWithinGracePeriod(now);
    
    for (const dose of overdueDoses) {
      if (!dose.logged) {
        await markDoseAsMissed(dose);
        await updateHealthScore(dose.profileId, -10);
        await triggerHelperNotification(dose);
      }
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background task
await BackgroundFetch.registerTaskAsync(MISSED_DOSE_CHECK_TASK, {
  minimumInterval: 15 * 60, // 15 minutes
  stopOnTerminate: false,
  startOnBoot: true
});
```

**Limitation:** Background tasks on Android may be delayed/skipped by battery optimization. Solution: Recommend users disable battery optimization for this app.

### Custom Notification Sounds

**File Format:** WAV or MP3
**Location:** assets/sounds/
**Max Size:** <500KB recommended

**Adding Custom Sound:**
1. Place file in assets/sounds/
2. Reference in app.json config plugin
3. Use filename in notification content:
   ```javascript
   sound: 'custom-sound.wav'
   ```

### Badge Management

```javascript
// Set badge count to number of pending doses
const updateBadgeCount = async (profileId) => {
  const pendingCount = await getPendingDosesCount(profileId);
  await Notifications.setBadgeCountAsync(pendingCount);
};

// Clear badge when app is opened
await Notifications.setBadgeCountAsync(0);
```

---

## Family Helper Mode

### Overview

Family Helper Mode enables caregivers to receive notifications when a patient misses medication doses, using local WiFi network communication without cloud intermediary.

### Architecture

**Communication Method:** WiFi Direct / mDNS + WebSocket
**Data Transmitted:** Missed dose events + health score only
**Encryption:** AES-256 with keys exchanged via QR code
**Network Requirement:** Both devices on same WiFi network

### Pairing Flow

#### Patient Side (Primary Device)

1. Navigate to Settings → Helper Mode
2. Tap "Add Helper"
3. App generates pairing data:
   - Unique device ID
   - Encryption key (random 256-bit)
   - Profile ID
4. Display QR code containing encrypted pairing data
5. QR remains valid for 5 minutes
6. On successful pairing, save to helper_pairings table

#### Helper Side (Secondary Device)

1. Install same app
2. Navigate to Helper Mode → Scan to Pair
3. Camera opens to scan QR code
4. Decode pairing data
5. Establish connection to patient device (mDNS discovery)
6. Exchange handshake
7. Save pairing locally
8. Display confirmation: "Now monitoring [Patient Name]"

### Technical Implementation

#### QR Code Generation

```javascript
import QRCode from 'react-native-qrcode-svg';
import * as Crypto from 'expo-crypto';

const generatePairingQR = async (profileId) => {
  // Generate encryption key
  const encryptionKey = await Crypto.getRandomBytesAsync(32);
  const keyBase64 = btoa(String.fromCharCode(...encryptionKey));
  
  // Create pairing data
  const pairingData = {
    deviceId: await getDeviceId(),
    profileId,
    encryptionKey: keyBase64,
    version: 1,
    timestamp: Date.now()
  };
  
  // Serialize and encode
  const qrData = JSON.stringify(pairingData);
  
  return qrData; // Pass to QRCode component
};

// In component
<QRCode
  value={qrData}
  size={300}
  backgroundColor="white"
  color="black"
/>
```

#### mDNS Service Discovery

```javascript
import Zeroconf from 'react-native-zeroconf';

const zeroconf = new Zeroconf();

// Patient device: Advertise service
const advertiseService = () => {
  zeroconf.publishService(
    'medication-tracker',      // Type
    'local',                   // Domain
    `patient-${deviceId}`,     // Name
    3000                       // Port
  );
};

// Helper device: Discover patient device
const discoverPatientDevice = (patientDeviceId) => {
  return new Promise((resolve) => {
    zeroconf.on('resolved', (service) => {
      if (service.name === `patient-${patientDeviceId}`) {
        resolve({
          host: service.addresses[0],
          port: service.port
        });
      }
    });
    
    zeroconf.scan('medication-tracker', 'local');
  });
};
```

#### Encrypted WebSocket Communication

```javascript
import { io } from 'socket.io-client';
import CryptoJS from 'crypto-js';

class SecureHelperConnection {
  constructor(encryptionKey) {
    this.key = encryptionKey;
    this.socket = null;
  }
  
  connect(host, port) {
    this.socket = io(`http://${host}:${port}`, {
      transports: ['websocket']
    });
    
    this.socket.on('missed-dose', (encrypted) => {
      const decrypted = this.decrypt(encrypted);
      this.handleMissedDose(JSON.parse(decrypted));
    });
  }
  
  encrypt(data) {
    return CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      this.key
    ).toString();
  }
  
  decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  handleMissedDose(data) {
    // data: { medicationName, scheduledTime, healthScore }
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Missed Medication Alert',
        body: `${data.medicationName} was missed at ${data.scheduledTime}`,
        data: { type: 'helper-alert' }
      },
      trigger: null // Immediate
    });
  }
}
```

### Data Transmitted

**Missed Dose Event:**
```json
{
  "type": "missed-dose",
  "medicationName": "Aspirin 100mg",
  "scheduledTime": "2026-02-11T09:00:00Z",
  "healthScore": 73.5,
  "timestamp": 1707642000000
}
```

**Health Score Update:**
```json
{
  "type": "health-update",
  "healthScore": 80.0,
  "timestamp": 1707642000000
}
```

### Connection Management

**Heartbeat:** Every 30 seconds to maintain connection
**Reconnection:** Auto-retry with exponential backoff
**Timeout:** 60 seconds for initial connection
**Error Handling:** Display connection status in UI

### UI Components

#### Patient View
- List of paired helpers
- Connection status indicator (green/red dot)
- "Remove Helper" button
- Last sync timestamp

#### Helper View
- List of monitored patients
- Health score display
- Recent missed dose alerts
- Connection status

### Privacy Considerations

**Data Minimization:**
- Only transmit dose status, not full medication details
- No continuous monitoring, only event-driven
- Helper cannot access dose history or notes

**User Consent:**
- Clear explanation before pairing
- Revoke access anytime
- No hidden background sync

**Security:**
- End-to-end encryption
- Local network only (no internet routing)
- Pairing keys not recoverable if lost

---

## UI/UX Design Requirements

### Design System

#### Color Palette

**Primary Colors:**
- Primary: #4CAF50 (Green) - Health, medication
- Secondary: #2196F3 (Blue) - Information, actions
- Accent: #FF9800 (Orange) - Warnings, attention

**Health Circle Colors:**
- Healthy: #4CAF50 (Green)
- Attention: #FFC107 (Yellow)
- Risk: #FF9800 (Orange)
- Critical: #F44336 (Red)

**Neutral Colors:**
- Background: #FAFAFA (Light gray)
- Surface: #FFFFFF (White)
- Text Primary: #212121 (Almost black)
- Text Secondary: #757575 (Medium gray)
- Divider: #E0E0E0 (Light gray)

#### Typography

**Font Family:** System default (Roboto on Android, SF Pro on iOS)

**Arabic Font Considerations:**
- Use native system Arabic font (automatically handled)
- Increase line height by 1.2x for Arabic text
- Minimum font size: 16sp (accessibility)

**Font Sizes:**
- Headline: 24sp
- Title: 20sp
- Body: 16sp
- Caption: 14sp
- Small: 12sp

**Font Weights:**
- Regular: 400
- Medium: 500
- Bold: 700

#### Spacing System

**Base Unit:** 8dp

**Spacing Scale:**
- xs: 4dp
- sm: 8dp
- md: 16dp
- lg: 24dp
- xl: 32dp
- xxl: 48dp

#### Elevation (Shadows)

**Level 1:** Card surfaces, buttons
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 2
```

**Level 2:** Floating action buttons, dropdowns
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 8,
elevation: 4
```

### Screen Layouts

#### Home Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  Profile Selector    [Settings Icon]│
├─────────────────────────────────────┤
│                                     │
│         Health Circle               │
│          (Large, Center)            │
│                                     │
├─────────────────────────────────────┤
│   Storage Indicators (Horizontal)   │
│   [Med1: 14d] [Med2: 3d] [Med3: 7d] │
├─────────────────────────────────────┤
│         Today's Doses               │
│   ┌─────────────────────────────┐  │
│   │ 9:00 AM - Aspirin 100mg     │  │
│   │ [Take] [Skip]          ✓    │  │
│   └─────────────────────────────┘  │
│   ┌─────────────────────────────┐  │
│   │ 2:00 PM - Metformin 500mg   │  │
│   │ [Take] [Skip]               │  │
│   └─────────────────────────────┘  │
│                                     │
│   [+] Add Medication                │
└─────────────────────────────────────┘
```

**Interactions:**
- Pull-to-refresh health score
- Swipe dose card left for options (edit, delete)
- Tap health circle for statistics
- Long-press storage circle for refill

#### Add Medication Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  [Back] Add Medication         [X]  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🔍 Search medication...       │ │
│  └───────────────────────────────┘ │
│                                     │
│  Search Results:                    │
│  ┌─────────────────────────────┐  │
│  │ [Pill Image] Aspirin 100mg  │  │
│  │ Generic: Acetylsalicylic    │  │
│  └─────────────────────────────┘  │
│  ┌─────────────────────────────┐  │
│  │ [Pill Image] Aspirin 325mg  │  │
│  └─────────────────────────────┘  │
│                                     │
│  Or enter manually                  │
│  [Manual Entry]                     │
└─────────────────────────────────────┘
```

#### Medication Detail Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  [Back] Aspirin 100mg     [Edit]    │
├─────────────────────────────────────┤
│                                     │
│         [Pill Image]                │
│                                     │
│  Dosage: 100mg Tablet               │
│  Schedule: 2x daily (9 AM, 9 PM)    │
│  Current Stock: 28 pills (14 days)  │
│                                     │
│  [Refill]                           │
│                                     │
│  Recent Doses:                      │
│  ✓ Feb 11, 9:00 AM - Taken          │
│  ✗ Feb 10, 9:00 PM - Missed         │
│  ✓ Feb 10, 9:00 AM - Taken          │
│                                     │
│  [View Full History]                │
│  [Delete Medication]                │
└─────────────────────────────────────┘
```

### Component Specifications

#### Health Circle Component

```javascript
// Props
{
  score: number,        // 0-100
  size: number,         // Diameter in dp
  animated: boolean     // Smooth transitions
}

// Visual specs
- Circle width: size
- Stroke width: size * 0.12
- Center text: score + "%"
- Label below: status text
- Pulsing animation on update
```

#### Dose Card Component

```javascript
// Props
{
  medication: Medication,
  scheduledTime: string,
  status: 'pending' | 'taken' | 'missed' | 'skipped',
  onTake: () => void,
  onSkip: () => void
}

// Visual specs
- Card elevation: Level 1
- Height: 80dp
- Padding: 16dp
- Border radius: 8dp
- Status indicator: colored bar on start edge
```

#### Storage Circle Component

```javascript
// Props
{
  daysRemaining: number,
  size: 'small' | 'medium',
  onPress: () => void
}

// Visual specs
- Small: 40dp diameter
- Medium: 60dp diameter
- Stroke width: 4dp
- Center: days number
- Color: dynamic based on days
```

### Accessibility

#### Screen Reader Support

**All interactive elements must have:**
- `accessibilityLabel`: Descriptive label in current language
- `accessibilityHint`: Action hint if not obvious
- `accessibilityRole`: button, link, header, etc.

**Example:**
```javascript
<TouchableOpacity
  onPress={handleTakeDose}
  accessibilityLabel="Take Aspirin 100mg dose"
  accessibilityHint="Marks this dose as taken"
  accessibilityRole="button"
>
  <Text>Take</Text>
</TouchableOpacity>
```

#### Touch Target Sizes

**Minimum:** 44x44dp for all interactive elements

**Padding:** Add invisible padding if visual element is smaller:
```javascript
<TouchableOpacity 
  style={{ padding: 12 }} // Ensures 44dp total
>
  <Icon size={20} />
</TouchableOpacity>
```

#### Color Contrast

**Text on Background:**
- Normal text: 4.5:1 minimum
- Large text (18sp+): 3:1 minimum
- Use online contrast checker during design

#### High Contrast Mode

Detect and respect system preference:
```javascript
import { AccessibilityInfo } from 'react-native';

const [highContrast, setHighContrast] = useState(false);

useEffect(() => {
  AccessibilityInfo.isHighTextContrastEnabled().then(setHighContrast);
}, []);

// Use stronger colors when highContrast is true
```

### Loading States

**Skeleton Screens:** Use for initial data loads
**Spinners:** Use for network requests
**Progress Indicators:** Use for batch operations

**Example: Medication List Loading**
```javascript
{loading ? (
  <SkeletonCard count={3} />
) : (
  medications.map(med => <MedicationCard {...med} />)
)}
```

### Error States

**Empty States:** Friendly illustrations + action
**Network Errors:** Retry button + cached data fallback
**Validation Errors:** Inline, specific messages

**Example: No Medications**
```
┌─────────────────────────────┐
│                             │
│     [Empty Pill Bottle]     │
│                             │
│   No medications yet        │
│   Add your first one        │
│                             │
│   [+ Add Medication]        │
│                             │
└─────────────────────────────┘
```

### Animations

**Timing:**
- Quick: 200ms (micro-interactions)
- Normal: 300ms (transitions)
- Slow: 500ms (emphasis)

**Easing:**
- Ease-out: Elements entering
- Ease-in: Elements exiting
- Ease-in-out: Transformations

**Example: Dose Card Swipe**
```javascript
<Animated.View
  style={{
    transform: [{
      translateX: swipeAnimation.interpolate({
        inputRange: [-100, 0],
        outputRange: [-100, 0]
      })
    }]
  }}
>
  {/* Card content */}
</Animated.View>
```

---

## File Structure

### Proposed Directory Layout

```
medication-tracker/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout (i18n, theme, providers)
│   ├── index.tsx                 # Home screen (/)
│   ├── (tabs)/                   # Tab group
│   │   ├── _layout.tsx           # Tab navigator configuration
│   │   ├── index.tsx             # Home tab (redirects to /)
│   │   ├── medications.tsx       # Medications list tab
│   │   └── settings.tsx          # Settings tab
│   ├── medications/
│   │   ├── [id].tsx              # Medication detail screen
│   │   ├── add.tsx               # Add medication screen
│   │   └── edit/[id].tsx         # Edit medication screen
│   ├── profiles/
│   │   ├── select.tsx            # Profile selector
│   │   ├── create.tsx            # Create new profile
│   │   └── edit/[id].tsx         # Edit profile
│   ├── helper/
│   │   ├── index.tsx             # Helper mode dashboard
│   │   ├── pair.tsx              # Pairing screen (QR scanner)
│   │   └── monitor/[id].tsx      # Monitor patient screen
│   ├── statistics/
│   │   └── [profileId].tsx       # Statistics dashboard
│   └── +not-found.tsx            # 404 screen
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── medication/
│   │   │   ├── MedicationCard.tsx
│   │   │   ├── DoseCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── PillImage.tsx
│   │   ├── health/
│   │   │   ├── HealthCircle.tsx
│   │   │   ├── StorageCircle.tsx
│   │   │   └── HealthStats.tsx
│   │   ├── profile/
│   │   │   ├── ProfileSelector.tsx
│   │   │   └── ProfileAvatar.tsx
│   │   └── helper/
│   │       ├── PairingQR.tsx
│   │       └── HelperStatusCard.tsx
│   │
│   ├── database/                 # SQLite database layer
│   │   ├── index.ts              # Database initialization
│   │   ├── migrations/           # Database migrations
│   │   │   └── v1_initial.ts
│   │   ├── repositories/         # Repository pattern (data access)
│   │   │   ├── ProfileRepository.ts
│   │   │   ├── MedicationRepository.ts
│   │   │   ├── ScheduleRepository.ts
│   │   │   ├── DoseLogRepository.ts
│   │   │   ├── HealthMetricsRepository.ts
│   │   │   ├── ApiCacheRepository.ts
│   │   │   └── HelperPairingRepository.ts
│   │   └── models/               # TypeScript type definitions
│   │       ├── Profile.ts
│   │       ├── Medication.ts
│   │       ├── Schedule.ts
│   │       ├── DoseLog.ts
│   │       └── HealthMetrics.ts
│   │
│   ├── services/                 # Business logic services
│   │   ├── api/                  # External API integrations
│   │   │   ├── RxNormService.ts
│   │   │   ├── OpenFDAService.ts
│   │   │   ├── DailyMedService.ts
│   │   │   └── RateLimiter.ts
│   │   ├── notification/
│   │   │   ├── NotificationScheduler.ts
│   │   │   ├── NotificationHandler.ts
│   │   │   └── MissedDoseDetector.ts
│   │   ├── health/
│   │   │   ├── HealthScoreCalculator.ts
│   │   │   └── StorageCalculator.ts
│   │   ├── helper/
│   │   │   ├── HelperConnectionManager.ts
│   │   │   ├── SecureChannel.ts
│   │   │   └── QRCodeGenerator.ts
│   │   └── sync/
│   │       ├── DataSyncService.ts
│   │       └── ConflictResolver.ts
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDatabase.ts        # Database connection hook
│   │   ├── useMedications.ts     # Medication CRUD operations
│   │   ├── useDoses.ts           # Dose logging operations
│   │   ├── useHealthScore.ts     # Health score calculations
│   │   ├── useNotifications.ts   # Notification management
│   │   ├── useProfile.ts         # Profile management
│   │   ├── useHelperMode.ts      # Helper pairing & sync
│   │   └── useNetworkStatus.ts   # Online/offline detection
│   │
│   ├── utils/                    # Utility functions
│   │   ├── date.ts               # Date formatting & calculations
│   │   ├── validation.ts         # Input validation
│   │   ├── storage.ts            # AsyncStorage helpers
│   │   ├── encryption.ts         # Encryption utilities
│   │   ├── uuid.ts               # UUID generation
│   │   └── logger.ts             # Logging utility (dev only)
│   │
│   ├── i18n/                     # Internationalization
│   │   ├── index.ts              # i18n configuration
│   │   ├── resources.ts          # Language resource imports
│   │   └── locales/
│   │       ├── ar/
│   │       │   ├── common.json
│   │       │   ├── home.json
│   │       │   ├── medications.json
│   │       │   ├── settings.json
│   │       │   ├── errors.json
│   │       │   └── notifications.json
│   │       └── en/
│   │           ├── common.json
│   │           ├── home.json
│   │           ├── medications.json
│   │           ├── settings.json
│   │           ├── errors.json
│   │           └── notifications.json
│   │
│   ├── constants/                # App constants
│   │   ├── colors.ts             # Color palette
│   │   ├── spacing.ts            # Spacing system
│   │   ├── typography.ts         # Font sizes & weights
│   │   ├── api.ts                # API endpoints
│   │   └── config.ts             # App configuration
│   │
│   └── types/                    # Shared TypeScript types
│       ├── api.ts                # API response types
│       ├── navigation.ts         # Navigation types
│       └── common.ts             # Common utility types
│
├── assets/
│   ├── images/
│   │   ├── icon.png              # App icon (1024x1024)
│   │   ├── splash.png            # Splash screen
│   │   ├── adaptive-icon.png     # Android adaptive icon
│   │   ├── notification-icon.png # Notification icon
│   │   └── placeholders/
│   │       └── pill-placeholder.png
│   ├── sounds/
│   │   └── pill-reminder.wav    # Default notification sound
│   └── fonts/                    # Custom fonts (if any)
│
├── __tests__/                    # Test files
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── utils/
│
├── .expo/                        # Expo build artifacts (gitignored)
├── node_modules/                 # Dependencies (gitignored)
│
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # NPM dependencies
├── .gitignore
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── README.md                     # Project documentation
└── metro.config.js               # Metro bundler configuration
```

### File Naming Conventions

**Components:**
- PascalCase: `MedicationCard.tsx`, `HealthCircle.tsx`
- One component per file
- Export as default

**Hooks:**
- camelCase with "use" prefix: `useMedications.ts`, `useHealthScore.ts`
- Export as named export

**Services:**
- PascalCase: `NotificationScheduler.ts`, `RxNormService.ts`
- Export class or object as default

**Utilities:**
- camelCase: `date.ts`, `validation.ts`
- Export individual functions as named exports

**Constants:**
- camelCase file: `colors.ts`
- UPPER_SNAKE_CASE exports: `PRIMARY_COLOR`, `API_BASE_URL`

### Import Order Convention

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

// 2. Internal aliases (if configured)
import { MedicationCard } from '@/components/medication/MedicationCard';
import { useMedications } from '@/hooks/useMedications';

// 3. Relative imports
import { calculateHealthScore } from '../utils/health';
import { COLORS } from '../constants/colors';

// 4. Type imports (last)
import type { Medication } from '../database/models/Medication';
```

### Path Alias Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@services/*": ["src/services/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@constants/*": ["src/constants/*"],
      "@database/*": ["src/database/*"],
      "@i18n/*": ["src/i18n/*"]
    }
  }
}
```

---

## Development Workflow

### Initial Setup

1. **Firebase Studio (Google IDX) Setup:**
   - Sign up for Google IDX waitlist
   - Create new Expo project in IDE
   - Configure Expo Go for development

2. **Project Initialization:**
   ```bash
   npx create-expo-app@latest medication-tracker --template blank-typescript
   cd medication-tracker
   ```

3. **Install Core Dependencies:**
   ```bash
   npx expo install expo-router expo-sqlite expo-notifications
   npx expo install expo-localization i18next react-i18next
   npx expo install @react-native-async-storage/async-storage
   npx expo install expo-image expo-barcode-scanner
   npx expo install react-native-svg react-native-qrcode-svg
   npx expo install axios date-fns
   npm install @expo/vector-icons
   npm install react-native-zeroconf
   ```

4. **Configure app.json:**
   - Set app name (Arabic + English)
   - Configure plugins (expo-notifications, expo-router)
   - Set permissions
   - Configure splash screen and icon

5. **Setup Directory Structure:**
   - Create folders as per file structure above
   - Initialize database module
   - Setup i18n configuration

### Development Process

#### Phase 1: Core Foundation (Weeks 1-2)
- Setup SQLite database with all tables
- Implement repository pattern for data access
- Create basic UI components (Card, Button, Input)
- Setup i18n with Arabic and English
- Configure RTL layout

#### Phase 2: Medication Management (Weeks 3-4)
- Implement medication search (local first)
- Integrate RxNorm API with rate limiting
- Build medication CRUD operations
- Create add/edit medication screens
- Implement pill count tracking

#### Phase 3: Dose Logging & Notifications (Weeks 5-6)
- Setup expo-notifications
- Implement notification scheduling
- Create dose logging interface
- Build missed dose detection
- Implement health score calculation

#### Phase 4: Profiles & Gamification (Week 7)
- Implement multi-profile support
- Create profile management screens
- Build health circle visualization
- Implement storage indicators
- Add statistics dashboard

#### Phase 5: Helper Mode (Weeks 8-9)
- Implement QR code pairing
- Setup mDNS service discovery
- Build encrypted WebSocket communication
- Create helper interface
- Test local network sync

#### Phase 6: Polish & Testing (Week 10)
- Comprehensive testing on physical device
- Performance optimization
- Accessibility audit
- Arabic content review
- User acceptance testing

### Git Workflow

**Branching Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

**Commit Message Format:**
```
type(scope): subject

body (optional)

footer (optional)

Example:
feat(medications): add RxNorm API integration

- Implement search with rate limiting
- Add response caching
- Handle network errors gracefully

Closes #123
```

**Types:**
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Test additions or changes
- chore: Build process or auxiliary tool changes

### Code Review Checklist

**Before Submitting PR:**
- [ ] Code follows style guide
- [ ] All new code has TypeScript types
- [ ] No console.log statements (use logger utility)
- [ ] All strings externalized to i18n files
- [ ] Accessibility labels added to interactive elements
- [ ] RTL layout tested (switch to Arabic)
- [ ] No hardcoded colors (use constants)
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Database transactions used where appropriate

### Testing Strategy

#### Unit Tests
- Utility functions
- Health score calculator
- Date/time functions
- Validation logic

#### Integration Tests
- Database repositories
- API services
- Notification scheduler

#### Component Tests
- UI components (React Testing Library)
- User interactions
- Accessibility

#### Manual Testing Checklist
- [ ] All screens in Arabic RTL
- [ ] Notifications fire at scheduled times
- [ ] Offline mode works (airplane mode)
- [ ] Profile switching maintains data isolation
- [ ] Helper mode pairing and sync
- [ ] App survives device restart
- [ ] Battery optimization handling
- [ ] Low storage scenarios

---

## Boundaries & Constraints

### Hard Boundaries (Non-Negotiable)

1. **Privacy:**
   - No user data leaves device except via explicit user action
   - No telemetry, analytics, or crash reporting
   - No advertising SDKs
   - No user authentication/accounts

2. **Offline-First:**
   - All core features work without internet
   - Network requests never block critical paths
   - Graceful degradation when offline

3. **Local-Only Storage:**
   - All data in SQLite on device
   - No cloud database sync
   - No external storage (SD card)

4. **Platform:**
   - Android primary target
   - Development via Expo managed workflow
   - No custom native modules (except helper mode)

### Soft Constraints (Negotiable with Tradeoffs)

1. **Family Helper Mode:**
   - Requires Development Build (not Expo Go)
   - Requires same WiFi network
   - May have connection reliability issues
   - Alternative: Manual check-in via app

2. **Medication Database:**
   - Free APIs only (no paid subscriptions)
   - Limited to what RxNorm/OpenFDA provide
   - No drug interaction checking
   - No automatic dosage recommendations

3. **Notification Reliability:**
   - Subject to Android battery optimization
   - May be delayed/skipped on some devices
   - User must disable battery optimization
   - Cannot guarantee 100% delivery

4. **Image Storage:**
   - Pill images consume device storage
   - May need periodic cleanup
   - Graceful fallback to placeholders

### Technical Limitations

1. **Expo Go Limitations:**
   - WiFi Direct not available in Expo Go
   - Push notifications not available in Expo Go
   - Requires Development Build for full features

2. **Android Battery Optimization:**
   - Background tasks may be killed
   - Notifications may be delayed
   - Recommend user disable optimization

3. **SQLite Performance:**
   - Large datasets (10,000+ doses) may slow queries
   - Index strategy critical for performance
   - Regular database cleanup needed

4. **API Rate Limits:**
   - RxNorm: 20 req/sec per IP
   - OpenFDA: 240 req/min with API key
   - Batch operations must respect limits

### Resource Constraints

1. **Development Environment:**
   - Firebase Studio (Google IDX) only
   - No local development machine
   - Bandwidth limitations on cloud IDE
   - Build quota on EAS Build free tier

2. **Storage:**
   - SQLite database size grows with usage
   - Pill images cache can reach 100-200MB
   - Need storage cleanup mechanism

3. **Battery:**
   - Notifications consume battery
   - Background tasks drain battery
   - Trade-off between reliability and efficiency

---

## Invariants

### Data Integrity Invariants

1. **Profile Isolation:**
   - Medications ALWAYS linked to exactly one profile
   - Doses ALWAYS linked to medication's profile
   - No cross-profile data leakage

2. **Dose Logging:**
   - Every scheduled dose MUST have corresponding dose_log entry
   - status MUST be one of: 'taken', 'missed', 'skipped'
   - actual_time NULL if and only if status != 'taken'

3. **Health Score:**
   - ALWAYS between 0.0 and 100.0 inclusive
   - NEVER negative
   - Recalculated on every dose event

4. **Pill Count:**
   - current_count <= initial_count ALWAYS
   - current_count >= 0 ALWAYS
   - Decremented exactly once per taken dose

5. **Timestamps:**
   - created_at <= updated_at ALWAYS
   - Timestamps in Unix epoch (seconds)
   - Time zones irrelevant (all local time)

### Behavioral Invariants

1. **Notification Scheduling:**
   - Every active schedule MUST have notifications scheduled
   - Notification IDs MUST be stored for cancellation
   - Cancellation MUST occur before rescheduling

2. **Database Transactions:**
   - Multi-step operations MUST use transactions
   - Foreign key constraints ALWAYS enforced
   - Rollback on any step failure

3. **API Caching:**
   - Cache lookup ALWAYS precedes API call
   - Expired cache entries automatically purged
   - Cache miss triggers API call only if online

4. **Offline Behavior:**
   - Network failure NEVER crashes app
   - Offline actions queued for later sync (helper mode)
   - UI clearly indicates offline state

5. **RTL Layout:**
   - Arabic language ALWAYS uses RTL
   - English language ALWAYS uses LTR
   - Language change requires app reload

### UI Invariants

1. **Loading States:**
   - NEVER show blank screen during load
   - Skeleton screens for initial load
   - Spinners for subsequent loads

2. **Error States:**
   - ALWAYS provide user-actionable error messages
   - NEVER show technical error details to user
   - Retry option ALWAYS available for network errors

3. **Accessibility:**
   - ALL interactive elements have accessibility labels
   - Touch targets ALWAYS >= 44x44dp
   - Text contrast ALWAYS meets WCAG AA

4. **Responsiveness:**
   - Database queries MUST complete <50ms
   - UI updates MUST be immediate on user action
   - Network requests NEVER block UI

### Security Invariants

1. **Input Validation:**
   - ALL user input validated before database insertion
   - SQL injection protection via prepared statements
   - No executable code in user input

2. **Encryption:**
   - Helper pairing keys ALWAYS encrypted
   - WiFi communication ALWAYS encrypted
   - Encryption keys NEVER logged or transmitted

3. **Permissions:**
   - ONLY request necessary permissions
   - Permission denial gracefully handled
   - Functionality degraded, not blocked

---

## Common Mistakes to Avoid

### Architecture Mistakes

1. **❌ Using localStorage/sessionStorage in Expo:**
   - These are web-only APIs
   - ✅ Use AsyncStorage or SQLite instead

2. **❌ Mixing React Navigation with Expo Router:**
   - Creates navigation conflicts
   - ✅ Use Expo Router exclusively for navigation

3. **❌ Storing sensitive data in AsyncStorage:**
   - AsyncStorage is not encrypted
   - ✅ Use expo-secure-store for encryption keys

4. **❌ Not using transactions for multi-step database operations:**
   - Partial updates corrupt data
   - ✅ Wrap in BEGIN TRANSACTION / COMMIT

5. **❌ Forgetting foreign key constraints:**
   - Orphaned records accumulate
   - ✅ Enable PRAGMA foreign_keys = ON

### Performance Mistakes

1. **❌ Rendering large lists without FlatList:**
   - Causes memory issues and lag
   - ✅ Use FlatList with proper keyExtractor

2. **❌ Not debouncing search input:**
   - Excessive API calls and UI lag
   - ✅ Implement 300ms debounce

3. **❌ Loading all images at once:**
   - Consumes memory, crashes app
   - ✅ Lazy load with expo-image

4. **❌ Running heavy calculations on UI thread:**
   - Blocks rendering, freezes app
   - ✅ Use async operations or Web Workers

5. **❌ Not indexing database columns:**
   - Slow queries as data grows
   - ✅ Create indexes on foreign keys and search columns

### Notification Mistakes

1. **❌ Not requesting permissions before scheduling:**
   - Silent failure, no notifications
   - ✅ Request permissions on first use

2. **❌ Scheduling without checking battery optimization:**
   - Notifications may not fire
   - ✅ Prompt user to disable optimization

3. **❌ Not canceling old notifications before rescheduling:**
   - Duplicate notifications
   - ✅ Cancel all for medication before rescheduling

4. **❌ Using Date objects directly in notification triggers:**
   - Timezone issues
   - ✅ Use calendar triggers with explicit hour/minute

5. **❌ Not handling notification tap events:**
   - Poor UX, user can't act on notification
   - ✅ Implement NotificationResponseReceivedListener

### i18n & RTL Mistakes

1. **❌ Hardcoding strings in components:**
   - Cannot be translated
   - ✅ Use t('key') from useTranslation

2. **❌ Using paddingLeft/paddingRight instead of start/end:**
   - Breaks in RTL layout
   - ✅ Use paddingStart/paddingEnd

3. **❌ Not testing in Arabic RTL mode:**
   - Layout issues go unnoticed
   - ✅ Test every screen in Arabic

4. **❌ Forgetting to reload app after RTL change:**
   - RTL doesn't apply until reload
   - ✅ Call Updates.reloadAsync() after I18nManager.forceRTL()

5. **❌ Not handling Arabic plural forms:**
   - Grammatically incorrect text
   - ✅ Define all 6 Arabic plural forms

### API Integration Mistakes

1. **❌ Not implementing rate limiting:**
   - IP gets blocked by API provider
   - ✅ Use rate limiter for all API calls

2. **❌ Not caching API responses:**
   - Repeated identical requests
   - ✅ Cache responses for 30 days

3. **❌ Assuming API always returns expected structure:**
   - App crashes on malformed response
   - ✅ Validate response structure before parsing

4. **❌ Not handling offline scenario:**
   - App appears broken when offline
   - ✅ Check network status, show cached data

5. **❌ Exposing API keys in client code:**
   - Security risk (though RxNorm/OpenFDA are public)
   - ✅ Use environment variables even for public APIs

### Helper Mode Mistakes

1. **❌ Sending full medication details over network:**
   - Privacy violation
   - ✅ Send only dose status and health score

2. **❌ Not encrypting WiFi communication:**
   - Local network snooping possible
   - ✅ Use AES encryption with QR-exchanged keys

3. **❌ Assuming WiFi connection always available:**
   - Sync fails without explanation
   - ✅ Show connection status, graceful failure

4. **❌ Not validating pairing QR code data:**
   - Malicious QR codes could crash app
   - ✅ Validate structure and timestamp

5. **❌ Forgetting to clean up pairing when removed:**
   - Orphaned connections, memory leak
   - ✅ Stop services and remove listeners on unpair

### State Management Mistakes

1. **❌ Putting too much in global state:**
   - Unnecessary re-renders
   - ✅ Keep global state minimal, use local state

2. **❌ Not memoizing expensive calculations:**
   - Recalculated on every render
   - ✅ Use useMemo for health score, date formatting

3. **❌ Mutating state directly:**
   - React doesn't detect changes
   - ✅ Always create new objects/arrays

4. **❌ Not cleaning up listeners/timers:**
   - Memory leaks
   - ✅ Return cleanup function from useEffect

5. **❌ Overusing useEffect:**
   - Hard to debug, unpredictable execution order
   - ✅ Use event handlers when possible

### Testing Mistakes

1. **❌ Only testing on emulator:**
   - Notifications, sensors behave differently
   - ✅ Test on physical device regularly

2. **❌ Not testing with low battery mode:**
   - Notifications may not work
   - ✅ Test with battery saver enabled

3. **❌ Not testing with older Android versions:**
   - API differences cause crashes
   - ✅ Test on Android 10, 11, 12, 13, 14

4. **❌ Not testing RTL on actual Arabic device:**
   - System fonts, number formatting differ
   - ✅ Test on device with Arabic system language

5. **❌ Not testing offline scenario:**
   - Network errors only appear in production
   - ✅ Test with airplane mode, simulated slow network

---

## Testing Strategy

### Testing Pyramid

```
        /\
       /  \
      / E2E \          <- Few (critical paths only)
     /--------\
    /          \
   / Integration\      <- Some (API, database, services)
  /--------------\
 /                \
/   Unit Tests     \   <- Many (utils, calculations, validation)
--------------------
```

### Unit Testing

**Tools:** Jest + React Native Testing Library

**Test Coverage Goals:**
- Utilities: 90%+
- Services: 80%+
- Components: 70%+

**Example: Health Score Calculator**
```typescript
// src/services/health/__tests__/HealthScoreCalculator.test.ts

import { calculateHealthScore } from '../HealthScoreCalculator';

describe('HealthScoreCalculator', () => {
  it('should return 100 for new profile', () => {
    const score = calculateHealthScore([]);
    expect(score).toBe(100);
  });
  
  it('should increase score by 2 for perfect dose', () => {
    const events = [
      { type: 'perfect', timestamp: Date.now() }
    ];
    const score = calculateHealthScore(events, 50);
    expect(score).toBe(52);
  });
  
  it('should decrease score by 10 for missed dose', () => {
    const events = [
      { type: 'missed', timestamp: Date.now() }
    ];
    const score = calculateHealthScore(events, 50);
    expect(score).toBe(40);
  });
  
  it('should never exceed 100', () => {
    const events = Array(100).fill({ type: 'perfect' });
    const score = calculateHealthScore(events, 50);
    expect(score).toBe(100);
  });
  
  it('should never go below 0', () => {
    const events = Array(100).fill({ type: 'missed' });
    const score = calculateHealthScore(events, 50);
    expect(score).toBe(0);
  });
});
```

### Integration Testing

**Focus Areas:**
- Database CRUD operations
- API service integration
- Notification scheduling

**Example: Medication Repository**
```typescript
// src/database/repositories/__tests__/MedicationRepository.test.ts

import { setupTestDatabase, teardownTestDatabase } from '../../test-utils';
import { MedicationRepository } from '../MedicationRepository';

describe('MedicationRepository', () => {
  let db;
  let repo;
  
  beforeEach(async () => {
    db = await setupTestDatabase();
    repo = new MedicationRepository(db);
  });
  
  afterEach(async () => {
    await teardownTestDatabase(db);
  });
  
  it('should create medication', async () => {
    const med = await repo.create({
      profileId: 'test-profile',
      name: 'Test Med',
      initialCount: 30
    });
    
    expect(med.id).toBeDefined();
    expect(med.name).toBe('Test Med');
  });
  
  it('should retrieve medication by id', async () => {
    const created = await repo.create({...});
    const retrieved = await repo.getById(created.id);
    
    expect(retrieved.id).toBe(created.id);
  });
  
  it('should update current count', async () => {
    const med = await repo.create({...});
    await repo.decrementCount(med.id, 1);
    const updated = await repo.getById(med.id);
    
    expect(updated.currentCount).toBe(29);
  });
});
```

### Component Testing

**Tools:** @testing-library/react-native

**Example: HealthCircle Component**
```typescript
// src/components/health/__tests__/HealthCircle.test.tsx

import { render, screen } from '@testing-library/react-native';
import { HealthCircle } from '../HealthCircle';

describe('HealthCircle', () => {
  it('should render score', () => {
    render(<HealthCircle score={75} />);
    expect(screen.getByText('75%')).toBeTruthy();
  });
  
  it('should show correct status', () => {
    render(<HealthCircle score={75} />);
    expect(screen.getByText('Healthy')).toBeTruthy();
  });
  
  it('should change color based on score', () => {
    const { rerender } = render(<HealthCircle score={90} />);
    // Assert green color
    
    rerender(<HealthCircle score={30} />);
    // Assert red color
  });
});
```

### Manual Testing Checklist

#### Medication Management
- [ ] Search finds medications in local DB
- [ ] Search queries RxNorm API when online
- [ ] Offline search shows only local results
- [ ] Add medication with all fields
- [ ] Edit medication updates correctly
- [ ] Delete medication removes all related data
- [ ] Pill images load and cache

#### Dose Logging
- [ ] Take dose decrements pill count
- [ ] Take dose updates health score
- [ ] Skip dose applies correct penalty
- [ ] Missed dose detected after grace period
- [ ] Dose log history displays correctly
- [ ] Notes can be added to doses

#### Notifications
- [ ] Notifications fire at scheduled times (±1 min)
- [ ] Notification tap opens app to correct screen
- [ ] Notifications persist after device restart
- [ ] Multiple notifications per day work
- [ ] Weekly schedules work correctly
- [ ] Custom sounds play
- [ ] Badge count updates

#### Profiles
- [ ] Create new profile
- [ ] Switch between profiles
- [ ] Data isolated per profile
- [ ] Delete profile removes all data
- [ ] Health scores independent

#### Helper Mode
- [ ] QR code generates successfully
- [ ] Scanning QR pairs devices
- [ ] Missed dose triggers helper notification
- [ ] Health score syncs to helper
- [ ] Unpair removes connection
- [ ] Works only on same WiFi network

#### i18n & RTL
- [ ] App launches in correct language
- [ ] Language switch works
- [ ] RTL layout correct in Arabic
- [ ] Date/time formats correctly
- [ ] Numbers format correctly
- [ ] All strings translated

#### Performance
- [ ] App launches in <2 seconds
- [ ] Search results appear <200ms
- [ ] Database queries fast (no lag)
- [ ] Smooth scrolling in lists
- [ ] No memory leaks (test with large data)

#### Edge Cases
- [ ] Airplane mode (full offline)
- [ ] Low storage warning
- [ ] Low battery mode
- [ ] Device restart
- [ ] App in background for hours
- [ ] Time zone change
- [ ] Date change at midnight

---

## Deployment Considerations

### Build Configuration

#### Development Build (For Testing Helper Mode)

```bash
# Create development build
eas build --profile development --platform android

# Install on device
eas build:run --profile development --platform android
```

**app.json configuration:**
```json
{
  "expo": {
    "android": {
      "package": "com.medicationtracker.app"
    }
  }
}
```

#### Production Build

```bash
# Create APK for distribution
eas build --profile production --platform android --local
```

**eas.json:**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### App Store Preparation

#### Google Play Store

**Requirements:**
1. App signing key (generated by EAS or manually)
2. Privacy policy (no data collection statement)
3. App description in Arabic and English
4. Screenshots (5-8) showing key features
5. Feature graphic (1024x500)
6. App icon (512x512)

**Store Listing:**

**Title:** متتبع الدواء - Medication Tracker

**Short Description (Arabic):**
تطبيق لتتبع الأدوية وجدولها مع حماية كاملة للخصوصية، يعمل دون اتصال بالإنترنت

**Short Description (English):**
Privacy-first medication tracking and scheduling app, works completely offline

**Full Description:** (Include features, privacy guarantees, offline capability)

**Category:** Medical

**Content Rating:** Everyone

**Privacy Policy URL:** (Required, state no data collection)

#### Alternative Distribution

**Direct APK Distribution:**
- Share APK file directly
- Users must enable "Install from Unknown Sources"
- No automatic updates

**F-Droid:**
- Open-source app store
- No Google Services requirement
- Community-driven

### App Versioning

**Version Format:** MAJOR.MINOR.PATCH

**Example:** 1.0.0 → 1.1.0 → 1.1.1

**Changelog Format:**
```
## [1.1.0] - 2026-03-15
### Added
- Family Helper Mode with WiFi Direct sync
- Custom notification sounds

### Changed
- Improved medication search performance
- Updated Arabic translations

### Fixed
- Notification reliability on Android 12+
- RTL layout issues in statistics screen
```

### Database Migrations

**When app updates require schema changes:**

1. Increment schema version
2. Write migration script
3. Test migration with production data copy
4. Include migration in app update

**Example Migration:**
```typescript
// src/database/migrations/v2_add_notes.ts

export const migrateToV2 = async (db) => {
  const currentVersion = await db.getFirstAsync(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  );
  
  if (currentVersion.version >= 2) {
    return; // Already migrated
  }
  
  await db.execAsync(`
    BEGIN TRANSACTION;
    
    ALTER TABLE medications ADD COLUMN notes TEXT;
    
    INSERT INTO schema_version (version, applied_at)
    VALUES (2, strftime('%s', 'now'));
    
    COMMIT;
  `);
};
```

### Post-Launch Monitoring

**Without Telemetry:**
- Monitor app reviews for bug reports
- Create feedback form (optional)
- Monitor battery usage reports
- Track app size growth

**User Support:**
- Email support address
- FAQ section in app
- GitHub issues (if open-source)

### Maintenance Schedule

**Weekly:**
- Review user feedback
- Monitor API status (RxNorm, OpenFDA)

**Monthly:**
- Check for dependency updates
- Review app performance
- Update medication database cache

**Quarterly:**
- Security audit
- Accessibility audit
- Update translations if needed

---

## Appendices

### A. API Attribution Requirements

**Include in app's About/Settings screen:**

```
This application uses the following public data sources:

RxNorm API
U.S. National Library of Medicine (NLM)
National Institutes of Health
Department of Health and Human Services

Disclaimer: NLM is not responsible for this product and does not 
endorse or recommend it.

OpenFDA API
U.S. Food and Drug Administration (FDA)
Data provided as-is with no warranties.

DailyMed API
U.S. National Library of Medicine (NLM)
Structured product labeling data.
```

### B. Glossary

**RXCUI:** RxNorm Concept Unique Identifier - Unique ID for medications in RxNorm database

**TTY:** Term Type in RxNorm (SCD = Semantic Clinical Drug, SBD = Semantic Branded Drug)

**NDC:** National Drug Code - FDA's identifier for drug packages

**RTL:** Right-to-Left - Text direction for Arabic, Hebrew

**mDNS:** Multicast DNS - Service discovery protocol for local networks

**Grace Period:** Time window after scheduled dose before marking as missed

**Health Score:** Gamification metric (0-100%) based on adherence

**Storage Circle:** Visual indicator of remaining medication supply

---

## Conclusion

This document provides comprehensive technical specifications for developing an offline-first, privacy-focused medication tracking application in Arabic using React Native and Expo. The architecture prioritizes user privacy, data security, and offline functionality while maintaining a smooth, professional user experience.

**Key Success Factors:**
1. Strict adherence to offline-first architecture
2. Comprehensive testing on physical Android devices
3. Attention to Arabic RTL layout details
4. Reliable notification system implementation
5. Clear user communication about privacy guarantees

**Next Steps:**
1. Sign up for Google IDX (Firebase Studio) waitlist
2. Begin Phase 1: Core Foundation
3. Incremental development following phases
4. Regular testing on physical device
5. User feedback integration

**Development Time Estimate:** 10 weeks (full-time solo developer)

**Post-Launch Support:** Ongoing maintenance, bug fixes, and feature enhancements based on user feedback

---

**Document Prepared By:** Technical Specification Team  
**For:** Medication Tracker App Development  
**Date:** February 11, 2026  
**Version:** 1.0
