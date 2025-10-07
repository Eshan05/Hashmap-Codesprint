import mongoose, { Schema, Document, Model } from 'mongoose';

// Needa add a boolean that flags whether to store inputs given by user or not
interface ISymptomSearch extends Document {
  searchId: string; // Unique ID for the search
  symptoms: string;
  pastContext?: string;
  otherInfo?: string;
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
  symptoms: { type: String, required: true },
  duration: { type: Number },
  pastContext: { type: String },
  otherInfo: { type: String },
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