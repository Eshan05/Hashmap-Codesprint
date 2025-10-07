import type { ElementType } from "react";

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
  quickChecklist: string;
  reliefIdeas: string;
  finalVerdict: string;
  summaryHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  name: string;
  description: string;
  explanation: string;
  severityTrend?: string;
  lookoutFactor?: string;
}

export interface Medicine {
  name: string;
  commonUse: string;
  sideEffects: string[];
  adherence?: string;
}

export interface WhenToSeekHelp {
  title: string;
  whenContact?: string;
  curability?: string;
  explanation: string;
  criticality?: string;
  immediateSteps?: string[];
}

export interface ReliefIdea {
  title: string;
  description: string;
  icon?: string | ElementType;
}