import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type {
  LLMMedicineCommonPayload,
  LLMMedicineModePayload,
  MedicineSearchDocumentCore,
  MedicineSearchMode
} from '@/types/medicine-search';

export interface IMedicineSearch extends Document, MedicineSearchDocumentCore {
  result?: string;
  getCommonPayload(): LLMMedicineCommonPayload;
  getModePayload<T extends LLMMedicineModePayload>(): T;
}

const MedicineSearchSchema: Schema = new Schema(
  {
    searchId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    searchType: {
      type: String,
      required: true,
      enum: ['disease', 'name', 'sideEffects', 'ingredient', 'similar'] as MedicineSearchMode[]
    },
    query: { type: String, required: true },
    queryHash: { type: String, default: '', index: true },
    title: { type: String, default: '' },
    summary: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'ready', 'errored'], default: 'pending' },
    errorMessage: { type: String, default: '' },
    commonPayload: { type: String, default: '{}' },
    modePayload: { type: String, default: '{}' },
    duration: { type: Number },
    result: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: "medicine_searches",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

MedicineSearchSchema.index({ user: 1, queryHash: 1 });

MedicineSearchSchema.methods.getCommonPayload = function (): LLMMedicineCommonPayload {
  const raw = this.commonPayload;
  const fallback: LLMMedicineCommonPayload = {
    summary: '',
    bodyMechanismSummary: '',
    keyTakeaways: [],
    clinicalActions: [],
    riskAlerts: [],
    interactionNotes: [],
    monitoringGuidance: [],
    references: [],
    followUpPrompts: [],
    patientCounseling: [],
    disclaimer: ''
  };

  if (!raw) {
    return fallback;
  }

  let parsed: Partial<LLMMedicineCommonPayload> | null = null;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw) as LLMMedicineCommonPayload;
    } catch (error) {
      console.error('Failed to parse commonPayload for MedicineSearch', error);
    }
  } else {
    parsed = raw as LLMMedicineCommonPayload;
  }

  if (!parsed) {
    return fallback;
  }

  return {
    ...fallback,
    ...parsed,
  };
};

MedicineSearchSchema.methods.getModePayload = function <T extends LLMMedicineModePayload>(): T {
  const raw = this.modePayload;
  if (!raw) {
    return {} as T;
  }

  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error('Failed to parse modePayload for MedicineSearch', error);
    }
  }

  return raw as T;
};

let MedicineSearch: Model<IMedicineSearch>;
try {
  MedicineSearch = mongoose.model<IMedicineSearch>('MedicineSearch');
} catch (error) {
  MedicineSearch = mongoose.model<IMedicineSearch>('MedicineSearch', MedicineSearchSchema);
}

export default MedicineSearch;