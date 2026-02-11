import { MedicationRepository } from "../../database/repositories/MedicationRepository";

/**
 * StorageCalculator
 * Calculates the remaining medication storage time.
 */
export class StorageCalculator {
    private medicationRepository: MedicationRepository;

    constructor(medicationRepository: MedicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    /**
     * Calculates the remaining medication storage time for a given medication.
     * @param medicationId - The ID of the medication to calculate the storage time for.
     * @returns The remaining medication storage time in days.
     */
    async calculate(medicationId: string): Promise<number> {
        // TODO: Implement a more sophisticated storage time calculation.
        // This is a placeholder implementation that returns a static value.
        return 14;
    }
}
