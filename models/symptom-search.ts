import mongoose, { Schema, type Document, type Model } from 'mongoose';

/**
 * SymptomSearch model
 * This schema stores the user-submitted symptom search and the LLM-generated
 * analysis. Several fields are stored as JSON-serialized strings in the DB
 * (to match existing code that uses JSON.stringify before saving). Defaults
 * use valid JSON strings where appropriate to simplify parsing on read.
 */

interface Condition {
  name: string;
  description: string;
  explanation: string;
  severityTrend?: string;
}

interface Medicine {
  name: string;
  commonUse: string;
  sideEffects: string[];
  adherence?: string;
}

interface WhenToSeekHelp {
  title: string;
  explanation: string;
  criticality?: string;
  immediateSteps?: string[];
  curability?: string;
}

interface ReliefIdea {
  title: string;
  description: string;
  icon?: string;
}

interface ISymptomSearch extends Document {
  searchId: string; // Unique ID for the search
  user: mongoose.Types.ObjectId; // Reference to the user who made the search
  symptoms: string;
  pastContext?: string | null;
  otherInfo?: string | null;
  title: string; // Auto-generated title by LLM
  cumulativePrompt: string; // JSON string or plain string
  potentialConditions: string; // JSON string (array) stored as string by route.ts
  medicines: string; // JSON string (array) stored as string by route.ts
  whenToSeekHelp: string; // JSON string (array) stored as string by route.ts
  // Additional UI-oriented fields that page.tsx expects
  quickChecklist?: string; // JSON string (array of strings)
  reliefIdeas?: string; // JSON string (array of {title, description, icon?})
  // finalVerdict can be plain string or JSON-encoded
  finalVerdict: string; // string (possibly JSON-encoded)
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
        return parsed.map((c: any, idx: number) => ({
          name: (c && c.name) || 'Unknown',
          description: (c && c.description) || '',
          explanation: (c && c.explanation) || '',
          // UI uses ranking to determine labels like 'Primary signal'
          severityTrend: (c && c.severityTrend) || (idx === 0 ? 'Elevated' : idx === 1 ? 'Stable' : 'Mild'),
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
        return parsed.map((m: any, idx: number) => ({
          name: (m && m.name) || 'Unknown',
          commonUse: (m && m.commonUse) || '',
          sideEffects: Array.isArray(m && m.sideEffects) ? m.sideEffects : [],
          adherence: (m && m.adherence) || (idx === 0 ? 'High' : 'Moderate'),
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
        return parsed.map((w: any, idx: number) => ({
          title: (w && w.title) || `Alert ${idx + 1}`,
          explanation: (w && w.explanation) || '',
          criticality: (w && w.criticality) || (idx === 0 ? 'High' : 'Medium'),
          immediateSteps: Array.isArray(w && w.immediateSteps) ? w.immediateSteps : [],
          curability: (w && w.curability) || 'Unknown',
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
      return parsed.map((r: any) => ({
        title: (r && r.title) || 'Relief tip',
        description: (r && r.description) || '',
        icon: (r && r.icon) || undefined,
      }));
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