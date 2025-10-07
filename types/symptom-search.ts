export interface SymptomSearch {
  searchId: string;
  user: string;
  symptoms: string;
  duration?: number;
  pastContext?: string;
  otherInfo?: string;
  title: string;
  cumulativePrompt: string;
  potentialConditions: string;
  medicines: string;
  whenToSeekHelp: string;
  finalVerdict: string;
  summaryHash: string;
  createdAt: string;
  updatedAt: string;
}