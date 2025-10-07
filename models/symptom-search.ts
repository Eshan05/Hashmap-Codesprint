import mongoose, { Schema, type Document, type Model } from 'mongoose';
import User from './user';

interface ISymptomSearch extends Document {
  searchId: string; // Unique ID for the search
  user: mongoose.Types.ObjectId; // Reference to the user who made the search
  symptoms: string;
  pastContext?: string;
  otherInfo?: string;
  title: string; // Auto-generated title by LLM
  cumulativePrompt: string;
  potentialConditions: string;
  medicines: string;
  whenToSeekHelp: string;
  finalVerdict: string;
  summaryHash: string;
  createdAt: Date;
}

const SymptomSearchSchema: Schema = new Schema({
  searchId: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String, required: true },
  duration: { type: Number },
  pastContext: { type: String },
  otherInfo: { type: String },
  title: { type: String, default: '' },
  cumulativePrompt: { type: String, default: '' },
  potentialConditions: { type: String, default: '' },
  medicines: { type: String, default: '' },
  whenToSeekHelp: { type: String, default: '' },
  finalVerdict: { type: String, default: '' },
  summaryHash: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
let SymptomSearch: Model<ISymptomSearch>;
try {
  SymptomSearch = mongoose.model<ISymptomSearch>('SymptomSearch');
} catch (e) {
  SymptomSearch = mongoose.model<ISymptomSearch>('SymptomSearch', SymptomSearchSchema);
}

export default SymptomSearch;