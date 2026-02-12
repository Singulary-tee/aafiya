

#!/bin/bash

# Medication Tracker - File Structure Setup Script
# Only creates files/folders that don't already exist

echo "Setting up Medication Tracker file structure..."
echo "Skipping existing files/folders..."
echo ""

CREATED_COUNT=0
SKIPPED_COUNT=0

# Helper function to create directory if it doesn't exist
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "✓ Created directory: $1"
        ((CREATED_COUNT++))
    else
        ((SKIPPED_COUNT++))
    fi
}

# Helper function to create file with placeholder if it doesn't exist
create_file() {
    local filepath="$1"
    local placeholder="$2"
    
    if [ ! -f "$filepath" ]; then
        echo "$placeholder" > "$filepath"
        echo "✓ Created file: $filepath"
        ((CREATED_COUNT++))
    else
        ((SKIPPED_COUNT++))
    fi
}

# Create app directory structure (Expo Router)
create_dir "app"
create_dir "app/(tabs)"
create_dir "app/medications"
create_dir "app/medications/edit"
create_dir "app/profiles"
create_dir "app/profiles/edit"
create_dir "app/helper"
create_dir "app/helper/monitor"
create_dir "app/statistics"

# Create app files
create_file "app/_layout.tsx" "// Root layout - i18n, theme, providers
export default function RootLayout() {
  return null;
}"

create_file "app/index.tsx" "// Home screen
export default function HomeScreen() {
  return null;
}"

create_file "app/(tabs)/_layout.tsx" "// Tab navigator configuration
export default function TabLayout() {
  return null;
}"

create_file "app/(tabs)/index.tsx" "// Home tab (redirects to /)
export default function HomeTab() {
  return null;
}"

create_file "app/(tabs)/medications.tsx" "// Medications list tab
export default function MedicationsTab() {
  return null;
}"

create_file "app/(tabs)/settings.tsx" "// Settings tab
export default function SettingsTab() {
  return null;
}"

create_file "app/medications/[id].tsx" "// Medication detail screen
export default function MedicationDetail() {
  return null;
}"

create_file "app/medications/add.tsx" "// Add medication screen
export default function AddMedication() {
  return null;
}"

create_file "app/medications/edit/[id].tsx" "// Edit medication screen
export default function EditMedication() {
  return null;
}"

create_file "app/profiles/select.tsx" "// Profile selector
export default function SelectProfile() {
  return null;
}"

create_file "app/profiles/create.tsx" "// Create new profile
export default function CreateProfile() {
  return null;
}"

create_file "app/profiles/edit/[id].tsx" "// Edit profile
export default function EditProfile() {
  return null;
}"

create_file "app/helper/index.tsx" "// Helper mode dashboard
export default function HelperDashboard() {
  return null;
}"

create_file "app/helper/pair.tsx" "// Pairing screen (QR scanner)
export default function PairHelper() {
  return null;
}"

create_file "app/helper/monitor/[id].tsx" "// Monitor patient screen
export default function MonitorPatient() {
  return null;
}"

create_file "app/statistics/[profileId].tsx" "// Statistics dashboard
export default function Statistics() {
  return null;
}"

create_file "app/+not-found.tsx" "// 404 screen
export default function NotFound() {
  return null;
}"

# Create src directory structure
create_dir "src"
create_dir "src/components/common"
create_dir "src/components/medication"
create_dir "src/components/health"
create_dir "src/components/profile"
create_dir "src/components/helper"

# Create common components
create_file "src/components/common/Button.tsx" "// Reusable Button component
export const Button = () => null;"

create_file "src/components/common/Card.tsx" "// Reusable Card component
export const Card = () => null;"

create_file "src/components/common/Input.tsx" "// Reusable Input component
export const Input = () => null;"

create_file "src/components/common/LoadingSpinner.tsx" "// Loading spinner component
export const LoadingSpinner = () => null;"

create_file "src/components/common/ErrorBoundary.tsx" "// Error boundary component
export class ErrorBoundary {}"

# Create medication components
create_file "src/components/medication/MedicationCard.tsx" "// Medication card component
export const MedicationCard = () => null;"

create_file "src/components/medication/DoseCard.tsx" "// Dose card component
export const DoseCard = () => null;"

create_file "src/components/medication/SearchBar.tsx" "// Medication search bar
export const SearchBar = () => null;"

create_file "src/components/medication/PillImage.tsx" "// Pill image component
export const PillImage = () => null;"

# Create health components
create_file "src/components/health/HealthCircle.tsx" "// Health circle indicator
export const HealthCircle = () => null;"

create_file "src/components/health/StorageCircle.tsx" "// Storage circle indicator
export const StorageCircle = () => null;"

create_file "src/components/health/HealthStats.tsx" "// Health statistics component
export const HealthStats = () => null;"

# Create profile components
create_file "src/components/profile/ProfileSelector.tsx" "// Profile selector component
export const ProfileSelector = () => null;"

create_file "src/components/profile/ProfileAvatar.tsx" "// Profile avatar component
export const ProfileAvatar = () => null;"

# Create helper components
create_file "src/components/helper/PairingQR.tsx" "// QR code pairing component
export const PairingQR = () => null;"

create_file "src/components/helper/HelperStatusCard.tsx" "// Helper status card
export const HelperStatusCard = () => null;"

# Create database structure
create_dir "src/database"
create_dir "src/database/migrations"
create_dir "src/database/repositories"
create_dir "src/database/models"

create_file "src/database/index.ts" "// Database initialization
export const initDatabase = async () => {};"

create_file "src/database/migrations/v1_initial.ts" "// Initial database schema
export const migrateV1 = async () => {};"

# Create repositories
create_file "src/database/repositories/ProfileRepository.ts" "// Profile data access
export class ProfileRepository {}"

create_file "src/database/repositories/MedicationRepository.ts" "// Medication data access
export class MedicationRepository {}"

create_file "src/database/repositories/ScheduleRepository.ts" "// Schedule data access
export class ScheduleRepository {}"

create_file "src/database/repositories/DoseLogRepository.ts" "// Dose log data access
export class DoseLogRepository {}"

create_file "src/database/repositories/HealthMetricsRepository.ts" "// Health metrics data access
export class HealthMetricsRepository {}"

create_file "src/database/repositories/ApiCacheRepository.ts" "// API cache data access
export class ApiCacheRepository {}"

create_file "src/database/repositories/HelperPairingRepository.ts" "// Helper pairing data access
export class HelperPairingRepository {}"

# Create models
create_file "src/database/models/Profile.ts" "// Profile type definition
export interface Profile {}"

create_file "src/database/models/Medication.ts" "// Medication type definition
export interface Medication {}"

create_file "src/database/models/Schedule.ts" "// Schedule type definition
export interface Schedule {}"

create_file "src/database/models/DoseLog.ts" "// DoseLog type definition
export interface DoseLog {}"

create_file "src/database/models/HealthMetrics.ts" "// HealthMetrics type definition
export interface HealthMetrics {}"

# Create services structure
create_dir "src/services/api"
create_dir "src/services/notification"
create_dir "src/services/health"
create_dir "src/services/helper"
create_dir "src/services/sync"

# Create API services
create_file "src/services/api/RxNormService.ts" "// RxNorm API integration
export class RxNormService {}"

create_file "src/services/api/OpenFDAService.ts" "// OpenFDA API integration
export class OpenFDAService {}"

create_file "src/services/api/DailyMedService.ts" "// DailyMed API integration
export class DailyMedService {}"

create_file "src/services/api/RateLimiter.ts" "// API rate limiter
export class RateLimiter {}"

# Create notification services
create_file "src/services/notification/NotificationScheduler.ts" "// Notification scheduling
export class NotificationScheduler {}"

create_file "src/services/notification/NotificationHandler.ts" "// Notification handling
export class NotificationHandler {}"

create_file "src/services/notification/MissedDoseDetector.ts" "// Missed dose detection
export class MissedDoseDetector {}"

# Create health services
create_file "src/services/health/HealthScoreCalculator.ts" "// Health score calculation
export class HealthScoreCalculator {}"

create_file "src/services/health/StorageCalculator.ts" "// Storage calculation
export class StorageCalculator {}"

# Create helper services
create_file "src/services/helper/HelperConnectionManager.ts" "// Helper connection management
export class HelperConnectionManager {}"

create_file "src/services/helper/SecureChannel.ts" "// Secure communication channel
export class SecureChannel {}"

create_file "src/services/helper/QRCodeGenerator.ts" "// QR code generation
export class QRCodeGenerator {}"

# Create sync services
create_file "src/services/sync/DataSyncService.ts" "// Data synchronization
export class DataSyncService {}"

create_file "src/services/sync/ConflictResolver.ts" "// Conflict resolution
export class ConflictResolver {}"

# Create hooks directory
create_dir "src/hooks"

create_file "src/hooks/useDatabase.ts" "// Database connection hook
export const useDatabase = () => {};"

create_file "src/hooks/useMedications.ts" "// Medication CRUD operations
export const useMedications = () => {};"

create_file "src/hooks/useDoses.ts" "// Dose logging operations
export const useDoses = () => {};"

create_file "src/hooks/useHealthScore.ts" "// Health score calculations
export const useHealthScore = () => {};"

create_file "src/hooks/useNotifications.ts" "// Notification management
export const useNotifications = () => {};"

create_file "src/hooks/useProfile.ts" "// Profile management
export const useProfile = () => {};"

create_file "src/hooks/useHelperMode.ts" "// Helper pairing & sync
export const useHelperMode = () => {};"

create_file "src/hooks/useNetworkStatus.ts" "// Online/offline detection
export const useNetworkStatus = () => {};"

# Create utils directory
create_dir "src/utils"

create_file "src/utils/date.ts" "// Date formatting & calculations
export const formatDate = () => {};"

create_file "src/utils/validation.ts" "// Input validation
export const validate = () => {};"

create_file "src/utils/storage.ts" "// AsyncStorage helpers
export const storage = {};"

create_file "src/utils/encryption.ts" "// Encryption utilities
export const encrypt = () => {};"

create_file "src/utils/uuid.ts" "// UUID generation
export const generateUUID = () => {};"

create_file "src/utils/logger.ts" "// Logging utility
export const logger = {};"

# Create i18n structure
create_dir "src/i18n"
create_dir "src/i18n/locales/ar"
create_dir "src/i18n/locales/en"

create_file "src/i18n/index.ts" "// i18n configuration
export default {};"

create_file "src/i18n/resources.ts" "// Language resource imports
export const resources = {};"

# Create Arabic locale files
create_file "src/i18n/locales/ar/common.json" '{
  "app_name": "متتبع الدواء"
}'

create_file "src/i18n/locales/ar/home.json" '{
  "welcome": "مرحباً"
}'

create_file "src/i18n/locales/ar/medications.json" '{
  "add_medication": "إضافة دواء"
}'

create_file "src/i18n/locales/ar/settings.json" '{
  "settings": "الإعدادات"
}'

create_file "src/i18n/locales/ar/errors.json" '{
  "error": "خطأ"
}'

create_file "src/i18n/locales/ar/notifications.json" '{
  "reminder": "تذكير"
}'

# Create English locale files
create_file "src/i18n/locales/en/common.json" '{
  "app_name": "Medication Tracker"
}'

create_file "src/i18n/locales/en/home.json" '{
  "welcome": "Welcome"
}'

create_file "src/i18n/locales/en/medications.json" '{
  "add_medication": "Add Medication"
}'

create_file "src/i18n/locales/en/settings.json" '{
  "settings": "Settings"
}'

create_file "src/i18n/locales/en/errors.json" '{
  "error": "Error"
}'

create_file "src/i18n/locales/en/notifications.json" '{
  "reminder": "Reminder"
}'

# Create constants directory
create_dir "src/constants"

create_file "src/constants/colors.ts" "// Color palette
export const COLORS = {};"

create_file "src/constants/spacing.ts" "// Spacing system
export const SPACING = {};"

create_file "src/constants/typography.ts" "// Font sizes & weights
export const TYPOGRAPHY = {};"

create_file "src/constants/api.ts" "// API endpoints
export const API = {};"

create_file "src/constants/config.ts" "// App configuration
export const CONFIG = {};"

# Create types directory
create_dir "src/types"

create_file "src/types/api.ts" "// API response types
export interface ApiResponse {}"

create_file "src/types/navigation.ts" "// Navigation types
export type RootStackParamList = {};"

create_file "src/types/common.ts" "// Common utility types
export type Nullable<T> = T | null;"

# Create assets structure
create_dir "assets/images"
create_dir "assets/images/placeholders"
create_dir "assets/sounds"
create_dir "assets/fonts"

# Create test structure
create_dir "__tests__/components"
create_dir "__tests__/services"
create_dir "__tests__/hooks"
create_dir "__tests__/utils"

echo ""
echo "========================================="
echo "Setup complete!"
echo "Created: $CREATED_COUNT files/folders"
echo "Skipped: $SKIPPED_COUNT existing files/folders"
echo "========================================="
