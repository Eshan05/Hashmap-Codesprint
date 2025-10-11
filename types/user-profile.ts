export interface MedicalCondition { code?: string; name?: string; active?: boolean; onsetYear?: number | null }
export interface Allergy { substanceCode?: string; name?: string; severity?: 'mild' | 'moderate' | 'severe' | 'unknown'; confirmed?: boolean }
export interface Medication { name?: string; rxNorm?: string; dosage?: string | null; current?: boolean }
export interface FamilyHistoryItem { relation?: string; conditionCode?: string; name?: string; ageAtOnset?: number | null }
export interface Immunization { code?: string; name?: string; date?: string }
export interface MentalHealth { diagnoses?: Array<{ code?: string; name?: string }>; isUnderCare?: boolean }
export interface Pregnancy { status?: 'pregnant' | 'not_pregnant' | 'unknown'; dueDate?: string | null }

export interface FavouriteMedicine {
  rxNorm: string;
  name: string;
  reasonForFavoriting?: string;
  addedAt?: Date;
}

export interface SavedSearch {
  query: string;
  type: 'symptom' | 'condition' | 'medicine' | 'general';
  filters?: Record<string, string | number | boolean | (string | number)[]>;
  savedAt: Date;
}