/**
 * Represents a custom health metric logged by a user (e.g., blood pressure, glucose).
 */
export interface CustomHealthMetric {
    id: string;
    profile_id: string;
    metric_type: 'blood_pressure' | 'glucose' | 'weight' | 'heart_rate' | 'temperature' | 'other';
    value: string; // JSON string for complex values like BP ({"systolic": 120, "diastolic": 80})
    unit?: string | null; // 'mmHg', 'mg/dL', 'kg', 'bpm', '°C', etc.
    notes?: string | null;
    recorded_at: number; // Unix timestamp when the metric was recorded
    created_at: number; // Unix timestamp when the record was created
}

/**
 * Blood pressure reading parsed from value
 */
export interface BloodPressureValue {
    systolic: number;
    diastolic: number;
}

/**
 * Helper functions for working with custom health metrics
 */
export const CustomHealthMetricHelpers = {
    /**
     * Creates a blood pressure value string
     */
    createBloodPressureValue: (systolic: number, diastolic: number): string => {
        return JSON.stringify({ systolic, diastolic });
    },
    
    /**
     * Parses a blood pressure value from stored string
     */
    parseBloodPressureValue: (value: string): BloodPressureValue | null => {
        try {
            const parsed = JSON.parse(value);
            if (parsed.systolic && parsed.diastolic) {
                return { systolic: parsed.systolic, diastolic: parsed.diastolic };
            }
            return null;
        } catch {
            return null;
        }
    },
    
    /**
     * Creates a simple numeric value string
     */
    createNumericValue: (num: number): string => {
        return String(num);
    },
    
    /**
     * Parses a simple numeric value
     */
    parseNumericValue: (value: string): number | null => {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }
};
