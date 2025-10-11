import { Condition, Medicine, ReliefIdea, WhenToSeekHelp } from '@/types/symptom-search';
import mongoose, { Schema, type Document, type Model } from 'mongoose';

/**
 * SymptomSearch model
 * This schema stores the user-submitted symptom search and the LLM-generated
 * analysis. Several fields are stored as JSON-serialized strings in the DB
 * (to match existing code that uses JSON.stringify before saving). Defaults
 * use valid JSON strings where appropriate to simplify parsing on read.
 */

interface ISymptomSearch extends Document {
  searchId: string; // Unique ID for the search
  user: mongoose.Types.ObjectId; // Reference to the user who made the search
  symptoms: string;
  pastContext?: string | null;
  otherInfo?: string | null;
  title: string;
  cumulativePrompt: string;
  potentialConditions: string;
  medicines: string;
  whenToSeekHelp: string;
  // Additional UI-oriented fields that page.tsx expects
  quickChecklist: string;
  reliefIdeas: string;
  finalVerdict: string;
  summaryHash?: string;
  duration?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Helper instance methods (runtime only)
  getPotentialConditions(): Condition[];
  getMedicines(): Medicine[];
  getWhenToSeekHelp(): WhenToSeekHelp[];
  getCumulativePrompt(): string;
  getQuickChecklist(): string[];
  getReliefIdeas(): ReliefIdea[];
}

const SymptomSearchSchema: Schema<ISymptomSearch> = new Schema(
  {
    searchId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: { type: String, required: true },
    duration: { type: Number },
    pastContext: { type: String, default: '' },
    otherInfo: { type: String, default: '' },
    title: { type: String, default: '' },
    // These fields are stored as JSON strings elsewhere in the codebase
    cumulativePrompt: { type: String, default: '' },
    potentialConditions: { type: String, default: '[]' },
    medicines: { type: String, default: '[]' },
    whenToSeekHelp: { type: String, default: '[]' },
    quickChecklist: { type: String, default: '[]' },
    reliefIdeas: { type: String, default: '[]' },
    finalVerdict: { type: String, default: '' },
    summaryHash: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure fast lookup by summaryHash (used for caching)
SymptomSearchSchema.index({ summaryHash: 1 });

// Instance helpers to safely parse JSON-serialized fields that may be empty or already objects
SymptomSearchSchema.methods.getPotentialConditions = function (): Condition[] {
  const raw = this.potentialConditions;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      // Ensure each condition has expected fields used by the UI
      if (Array.isArray(parsed)) {
        return parsed.map((c: Record<string, unknown>, idx: number) => ({
          name: (c && typeof c.name === 'string') ? c.name : 'Unknown',
          description: (c && typeof c.description === 'string') ? c.description : '',
          explanation: (c && typeof c.explanation === 'string') ? c.explanation : '',
          // UI uses ranking to determine labels like 'Primary signal'
          severityTrend: (c && typeof c.severityTrend === 'string') ? c.severityTrend : (idx === 0 ? 'Elevated' : idx === 1 ? 'Stable' : 'Mild'),
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
};

SymptomSearchSchema.methods.getMedicines = function (): Medicine[] {
  const raw = this.medicines;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((m: Record<string, unknown>, idx: number) => ({
          name: (m && typeof m.name === 'string') ? m.name : 'Unknown',
          commonUse: (m && typeof m.commonUse === 'string') ? m.commonUse : '',
          sideEffects: Array.isArray(m.sideEffects) ? m.sideEffects as string[] : [],
          adherence: (m && typeof m.adherence === 'string') ? m.adherence : (idx === 0 ? 'High' : 'Moderate'),
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
};

SymptomSearchSchema.methods.getWhenToSeekHelp = function (): WhenToSeekHelp[] {
  const raw = this.whenToSeekHelp;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((w: Record<string, unknown>, idx: number) => ({
          title: (w && typeof w.title === 'string') ? w.title : `Alert ${idx + 1}`,
          explanation: (w && typeof w.explanation === 'string') ? w.explanation : '',
          criticality: (w && typeof w.criticality === 'string') ? w.criticality : (idx === 0 ? 'High' : 'Medium'),
          immediateSteps: Array.isArray(w.immediateSteps) ? w.immediateSteps as string[] : [],
          curability: (w && typeof w.curability === 'string') ? w.curability : 'Unknown',
        }));
      }
      return [];
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
};

SymptomSearchSchema.methods.getCumulativePrompt = function (): string {
  const raw = this.cumulativePrompt;
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  try {
    return JSON.stringify(raw);
  } catch (e) {
    return '';
  }
};

SymptomSearchSchema.methods.getQuickChecklist = function (): string[] {
  const raw = this.quickChecklist;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
};

SymptomSearchSchema.methods.getReliefIdeas = function (): ReliefIdea[] {
  const raw = this.reliefIdeas;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((r) => {
        if (typeof r === 'object' && r !== null) {
          const relief = r as Record<string, unknown>;
          return {
            title: typeof relief.title === 'string' ? relief.title : 'Relief tip',
            description: typeof relief.description === 'string' ? relief.description : '',
            icon: typeof relief.icon === 'string' ? relief.icon : undefined,
          };
        }
        return { title: 'Relief tip', description: '', icon: undefined };
      });
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
};

// Avoid OverwriteModelError when in watch/hot-reload environments
let SymptomSearch: Model<ISymptomSearch>;
try {
  SymptomSearch = mongoose.model<ISymptomSearch>('SymptomSearch');
} catch (e) {
  SymptomSearch = mongoose.model<ISymptomSearch>('SymptomSearch', SymptomSearchSchema);
}

export default SymptomSearch;