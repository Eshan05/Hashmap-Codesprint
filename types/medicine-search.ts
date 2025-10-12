export type MedicineSearchMode = 'disease' | 'name' | 'sideEffects' | 'ingredient' | 'similar';

export interface ClinicalAction {
  title: string;
  rationale: string;
  priority: 'urgent' | 'soon' | 'routine';
  evidenceLevel?: 'A' | 'B' | 'C';
}

export interface RiskAlert {
  name: string;
  severity: 'low' | 'moderate' | 'high';
  mitigation: string;
  triggerNotes?: string[];
}

export interface InteractionNote {
  interactingAgent: string;
  effect: string;
  recommendation: string;
  evidenceLevel?: 'A' | 'B' | 'C';
}

export interface MonitoringTip {
  metric: string;
  frequency: string;
  note: string;
}

export interface Reference {
  label: string;
  url?: string;
  citation?: string;
}

export interface LLMMedicineCommonPayload {
  summary: string;
  keyTakeaways: string[];
  clinicalActions: ClinicalAction[];
  riskAlerts: RiskAlert[];
  interactionNotes: InteractionNote[];
  monitoringGuidance: MonitoringTip[];
  references: Reference[];
  followUpPrompts: string[];
  patientCounseling: string[];
  disclaimer: string;
}

export interface TherapyOption {
  name: string;
  rationale: string;
  cautions?: string[];
  evidenceLevel?: 'A' | 'B' | 'C';
}

export interface LLMMedicineDiseasePayload {
  pathophysiologySnapshot: string;
  firstLineTherapies: TherapyOption[];
  secondLineOptions: TherapyOption[];
  combinationStrategies: TherapyOption[];
  monitoringPlan: MonitoringTip[];
  nonPharmacologicAdjuncts: string[];
  redFlags: string[];
}

export interface Indication {
  condition: string;
  note: string;
}

export interface Formulation {
  form: string;
  strengths: string[];
  release?: string;
  notes?: string;
}

export interface DosageInstruction {
  population: string;
  dose: string;
  frequency: string;
  maxDose?: string;
  titration?: string;
}

export interface AdjustmentGuidance {
  factor: string;
  recommendation: string;
  rationale?: string;
}

export interface LLMMedicineNamePayload {
  mechanism: string;
  primaryIndications: Indication[];
  formulations: Formulation[];
  dosingGuidance: DosageInstruction[];
  doseAdjustments: AdjustmentGuidance[];
  contraindications: string[];
  blackBoxWarnings: string[];
  commonSideEffects: string[];
  seriousSideEffects: string[];
  monitoringParameters: MonitoringTip[];
  patientCounselingPoints: string[];
}

export interface SideEffectCulprit {
  drugName: string;
  likelihood: 'possible' | 'probable' | 'definite';
  mechanism: string;
  onsetTiming: string;
}

export interface ManagementStrategy {
  strategy: string;
  steps: string[];
  monitoring?: string;
}

export interface AlternativeOption {
  name: string;
  comparison: string;
  pros: string[];
  cons: string[];
}

export interface LLMMedicineSideEffectsPayload {
  likelyCulprits: SideEffectCulprit[];
  mechanisticInsights: string;
  managementStrategies: ManagementStrategy[];
  alternativeOptions: AlternativeOption[];
  whenToEscalate: string[];
  documentationTips: string[];
}

export interface IngredientProduct {
  productName: string;
  form: string;
  strength: string;
  otc: boolean;
}

export interface LLMMedicineIngredientPayload {
  products: IngredientProduct[];
  brandEquivalents: string[];
  therapeuticClasses: string[];
  formulationDetails: Formulation[];
  regulatoryNotes: string[];
  availabilityConsiderations: string[];
  qualityFlags: string[];
}

export interface ComparisonValue {
  name: string;
  detail: string;
}

export interface ComparisonRow {
  attribute: string;
  baseline: string;
  alternatives: ComparisonValue[];
}

export interface LLMMedicineSimilarPayload {
  alternatives: AlternativeOption[];
  comparisonMatrix: ComparisonRow[];
  switchingGuidance: string[];
  costConsiderations: string[];
  transitionRisks: string[];
  monitoringAfterSwitch: MonitoringTip[];
}

export type LLMMedicineModePayload =
  | LLMMedicineDiseasePayload
  | LLMMedicineNamePayload
  | LLMMedicineSideEffectsPayload
  | LLMMedicineIngredientPayload
  | LLMMedicineSimilarPayload;

export interface MedicineSearchDocumentCore {
  searchId: string;
  user: string;
  searchType: MedicineSearchMode;
  query: string;
  title: string;
  status: 'pending' | 'ready' | 'errored';
  errorMessage?: string;
  queryHash: string;
  commonPayload: string;
  modePayload: string;
  summary?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineSearchParsed extends Omit<MedicineSearchDocumentCore, 'commonPayload' | 'modePayload'> {
  common: LLMMedicineCommonPayload;
  modeSpecific: LLMMedicineModePayload;
}
