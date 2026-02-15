# New Features Implementation Documentation

## Overview

This document covers the implementation of new features added to the Aafiya medication tracking app, including input methods, medication management enhancements, health metrics, duplicate detection, and notification improvements.

---

## 1. Database Schema Changes (Migration v2)

### New Medication Fields

Added to `medications` table:
- `therapy_type` (TEXT): 'limited' for courses like antibiotics, NULL for ongoing medications
- `therapy_duration` (INTEGER): Number of days for limited therapy
- `therapy_start_date` (INTEGER): Unix timestamp when therapy started
- `archived` (INTEGER): 1 for archived, 0 for active (soft delete)
- `archived_at` (INTEGER): Unix timestamp when archived
- `paused` (INTEGER): 1 for paused, 0 for active
- `paused_at` (INTEGER): Unix timestamp when paused
- `pause_reason` (TEXT): Reason for pausing medication

### New Table: custom_health_metrics

Stores custom health metrics like blood pressure, glucose, weight, etc.

```sql
CREATE TABLE custom_health_metrics (
    id TEXT PRIMARY KEY,
    profile_id TEXT NOT NULL,
    metric_type TEXT NOT NULL,  -- 'blood_pressure', 'glucose', 'weight', etc.
    value TEXT NOT NULL,         -- JSON string for complex values
    unit TEXT,                   -- 'mmHg', 'mg/dL', 'kg', etc.
    notes TEXT,
    recorded_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
```

### Updated DoseLog Status

Added 'delayed' status to dose_log for snoozed medication reminders.

---

## 2. Medication Management Features

### 2.1 Therapy Completion Tracking

**Purpose**: Track limited medication courses (antibiotics, tapers) with automatic archival.

**Implementation**:
- Set `therapy_type='limited'`, `therapy_duration`, and `therapy_start_date` when creating medication
- Use `isTherapyComplete()` to check if therapy is finished
- Use `getDaysRemainingInTherapy()` to show countdown
- Call `autoArchiveCompletedTherapies()` daily to auto-archive finished courses

**Usage Example**:
```typescript
import { isTherapyComplete, getDaysRemainingInTherapy } from '../../src/utils/medicationManagement';

// Check if therapy is complete
if (isTherapyComplete(medication)) {
    // Show "Therapy Complete" badge
}

// Show days remaining
const daysLeft = getDaysRemainingInTherapy(medication);
if (daysLeft !== null) {
    console.log(`${daysLeft} days remaining`);
}
```

### 2.2 Archive/Unarchive

**Purpose**: Soft delete medications while preserving medical history.

**Implementation**:
- Use `archiveMedication()` to archive (sets `archived=1`, `is_active=0`)
- Use `unarchiveMedication()` to restore
- Archived medications hidden from main lists but visible in archive view
- Screen: `app/medications/archived.tsx`

**Usage Example**:
```typescript
import { archiveMedication, unarchiveMedication } from '../../src/utils/medicationManagement';

// Archive a medication
await archiveMedication(medicationRepo, medicationId);

// Unarchive a medication
await unarchiveMedication(medicationRepo, medicationId);
```

### 2.3 Pause/Resume

**Purpose**: Temporarily hold medications without losing history (e.g., for surgery prep, drug interactions).

**Implementation**:
- Use `pauseMedication()` to pause with optional reason
- Use `resumeMedication()` to resume
- Paused medications don't generate reminders
- Paused medications can't be taken (UI prevents it)

**Usage Example**:
```typescript
import { pauseMedication, resumeMedication } from '../../src/utils/medicationManagement';

// Pause a medication
await pauseMedication(medicationRepo, medicationId, 'Pre-surgery preparation');

// Resume a medication
await resumeMedication(medicationRepo, medicationId);
```

### 2.4 Duplicate Detection

**Purpose**: Warn users before adding duplicate medications.

**Implementation**:
- Use `findDuplicateMedication()` to check for existing medication
- Compares normalized names (case-insensitive, trimmed)
- Also checks generic names
- Shows warning dialog if duplicate found

**Usage Example**:
```typescript
import { findDuplicateMedication } from '../../src/utils/medicationManagement';

// Check for duplicates before adding
const duplicate = await findDuplicateMedication(
    medicationRepo,
    profileId,
    medicationName
);

if (duplicate) {
    Alert.alert(
        'Duplicate Medication',
        `You already have ${duplicate.name} in your list.`,
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Anyway', onPress: () => saveMedication() }
        ]
    );
}
```

---

## 3. Quick Dose Actions

### 3.1 "Take All" Button

**Purpose**: Log multiple pending doses at once.

**Implementation**:
- Function: `takeAllDoses()` in `src/utils/quickDoseActions.ts`
- Atomically logs doses and decrements pill counts
- Checks medication availability and pause status
- Returns detailed success/failure results

**Usage Example**:
```typescript
import { takeAllDoses, getAvailableDosesCount } from '../../src/utils/quickDoseActions';

// Get count of doses that can be taken
const availableCount = await getAvailableDosesCount(profileId, todayDoses);

// Take all pending doses
const result = await takeAllDoses(profileId, todayDoses);
console.log(`Success: ${result.success}, Failed: ${result.failed}`);
result.errors.forEach(error => console.log(error));
```

### 3.2 "Skip All" Button

**Purpose**: Skip multiple pending doses at once.

**Usage Example**:
```typescript
import { skipAllDoses } from '../../src/utils/quickDoseActions';

const result = await skipAllDoses(profileId, todayDoses);
```

---

## 4. Health Metrics

### 4.1 Custom Health Metrics

**Purpose**: Log blood pressure, glucose, weight, and other health metrics.

**Implementation**:
- Model: `CustomHealthMetric` in `src/database/models/CustomHealthMetrics.ts`
- Repository: `CustomHealthMetricsRepository`
- Screen: `app/settings/health-metrics.tsx`

**Supported Metric Types**:
- `blood_pressure`: Systolic/diastolic readings in mmHg
- `glucose`: Blood glucose in mg/dL
- `weight`: Body weight in kg
- `heart_rate`: Heart rate in bpm
- `temperature`: Body temperature in °C
- `other`: Custom metrics

**Usage Example**:
```typescript
import { CustomHealthMetricsRepository } from '../../src/database/repositories/CustomHealthMetricsRepository';
import { CustomHealthMetricHelpers } from '../../src/database/models/CustomHealthMetrics';

const metricsRepo = new CustomHealthMetricsRepository(db);

// Log blood pressure
await metricsRepo.create({
    profile_id: profileId,
    metric_type: 'blood_pressure',
    value: CustomHealthMetricHelpers.createBloodPressureValue(120, 80),
    unit: 'mmHg',
    notes: null,
    recorded_at: Date.now(),
});

// Log glucose
await metricsRepo.create({
    profile_id: profileId,
    metric_type: 'glucose',
    value: CustomHealthMetricHelpers.createNumericValue(95),
    unit: 'mg/dL',
    notes: 'Fasting',
    recorded_at: Date.now(),
});
```

---

## 5. Notification Snooze

### 5.1 15-Minute Snooze

**Purpose**: Allow users to snooze medication reminders for 15 minutes, logging as "delayed" instead of "missed".

**Implementation**:
- Function: `snoozeMedicationReminder()` in `src/utils/notificationSnooze.ts`
- Dismisses current notification
- Schedules new notification after 15 minutes
- Logs dose as "delayed" (not "missed")
- Delayed doses get lighter health penalty (0.8 vs -1.0)

**Usage Example**:
```typescript
import { snoozeMedicationReminder, markDelayedDoseAsTaken } from '../../src/utils/notificationSnooze';

// Snooze a notification
const newNotificationId = await snoozeMedicationReminder(
    notificationId,
    profileId,
    medicationId,
    scheduleId,
    scheduledTime,
    medicationName
);

// Later, when user takes the medication
await markDelayedDoseAsTaken(
    profileId,
    medicationId,
    scheduleId,
    scheduledTime
);
```

### 5.2 Health Score Impact

**Delayed doses**: 0.8 points (vs 1.0 for taken, -1.0 for missed, -0.5 for skipped)

This encourages users to snooze rather than miss doses entirely.

---

## 6. Input Methods

### 6.1 Camera OCR (Placeholder)

**Purpose**: Snap photo of pill bottle to extract medication name.

**Implementation**:
- File: `src/utils/cameraOCR.ts`
- Currently a placeholder for production OCR service
- In production, integrate with:
  - Google Cloud Vision API
  - AWS Textract
  - react-native-text-recognition

**Usage Example**:
```typescript
import { captureAndExtractText, requestCameraPermission } from '../../src/utils/cameraOCR';

// Request permission
const hasPermission = await requestCameraPermission();

// Capture and extract text
await captureAndExtractText(
    cameraRef,
    (text) => {
        // Use extracted text
        setSearchQuery(text);
    },
    (error) => {
        Alert.alert('Error', error);
    }
);
```

### 6.2 Voice Input (Placeholder)

**Purpose**: Speak medication name to auto-fill search.

**Implementation**:
- File: `src/utils/voiceInput.ts`
- Currently a placeholder for production speech-to-text
- In production, integrate with:
  - expo-speech-recognition (if available)
  - react-native-voice
  - Google Speech-to-Text API

---

## 7. UI Integration Points

### 7.1 Home Screen

**Enhancements Needed**:
- Add "Take All" button when multiple pending doses exist
- Show therapy countdown for limited medications
- Show paused medication indicator
- Add snooze action to notification responses

### 7.2 Medication List

**Enhancements Needed**:
- Filter out archived medications by default
- Add "View Archived" button
- Show therapy completion badge
- Show paused indicator

### 7.3 Add Medication Screen

**Enhancements Needed**:
- Add camera OCR button
- Add voice input button
- Add duplicate detection check before saving
- Add therapy type selector (ongoing/limited)
- Add therapy duration input for limited courses

### 7.4 Edit Medication Screen

**Enhancements Needed**:
- Add pause/resume button
- Add archive button
- Show therapy progress
- Show days remaining for limited therapies

### 7.5 Settings Screen

**Additions**:
- Link to Health Metrics screen
- Link to Archived Medications screen

---

## 8. Testing Recommendations

### Database Migration
```bash
# Test migration on fresh database
# Test migration on existing database with data
# Verify all new columns added correctly
# Verify indexes created
```

### Medication Management
```bash
# Test therapy completion detection
# Test auto-archive of completed therapies
# Test archive/unarchive flow
# Test pause/resume flow
# Test duplicate detection
```

### Quick Actions
```bash
# Test "Take All" with multiple medications
# Test "Take All" with some out of stock
# Test "Take All" with some paused
# Test "Skip All" functionality
```

### Health Metrics
```bash
# Test blood pressure logging
# Test glucose logging
# Test metric history display
# Test input validation
```

### Notification Snooze
```bash
# Test snooze notification
# Test delayed dose logging
# Test health score calculation with delayed doses
# Test marking delayed dose as taken
```

---

## 9. Future Enhancements

### Input Methods
- Integrate production OCR service (Google Cloud Vision, AWS Textract)
- Integrate production speech-to-text service
- Add barcode scanning for medications

### Health Metrics
- Add charts and graphs for metric trends
- Add metric export for doctor visits
- Add metric goals and alerts
- Add more metric types (oxygen saturation, peak flow, etc.)

### Medication Management
- Add medication interaction checking
- Add refill reminder scheduling
- Add pharmacy integration
- Add medication cost tracking

### Analytics
- Adherence trends over time
- Medication effectiveness tracking
- Side effect logging
- Correlation between health metrics and medication adherence

---

## 10. Security & Privacy

All features maintain the app's privacy-first approach:
- All data stored locally in SQLite
- No health metrics transmitted to servers
- OCR can be done locally (no image uploads required)
- Voice recognition can use on-device processing
- Archived medications remain private and local

---

## Files Added/Modified

### New Files
- `src/database/migrations/v2_new_features.ts` - Database migration
- `src/database/models/CustomHealthMetrics.ts` - Health metrics model
- `src/database/repositories/CustomHealthMetricsRepository.ts` - Health metrics repository
- `src/utils/medicationManagement.ts` - Medication management utilities
- `src/utils/quickDoseActions.ts` - Take All/Skip All functionality
- `src/utils/notificationSnooze.ts` - Snooze functionality
- `src/utils/cameraOCR.ts` - OCR utilities (placeholder)
- `src/utils/voiceInput.ts` - Voice input utilities (placeholder)
- `app/medications/archived.tsx` - Archived medications screen
- `app/settings/health-metrics.tsx` - Health metrics screen

### Modified Files
- `src/database/index.ts` - Apply migration v2
- `src/database/models/Medication.ts` - Add new fields
- `src/database/models/DoseLog.ts` - Add delayed status
- `src/utils/healthScore.ts` - Support delayed doses

---

## Support

For questions or issues with the new features, please refer to:
- Main documentation: `README.md`
- Database schema: `src/database/migrations/`
- Utility functions: `src/utils/`
