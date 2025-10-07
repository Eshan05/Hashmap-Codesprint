import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedicineSearch extends Document {
  searchId: string;
  searchType: 'disease' | 'name' | 'sideEffects' | 'ingredient' | 'similar'; // Type of search
  query: string;  // The user's search query
  result: string; // JSON
  createdAt: Date;
}

const MedicineSearchSchema: Schema = new Schema({
  searchId: { type: String, required: true, unique: true },
  searchType: { type: String, required: true, enum: ['disease', 'name', 'sideEffects', 'ingredient', 'similar'] },
  query: { type: String, required: true },
  result: { type: String, default: '' }, // Will have basic description, function, uses, dosage and administration, side effects and any other information
  createdAt: { type: Date, default: Date.now },
});
//Overwrite model error
let MedicineSearch: Model<IMedicineSearch>
try {
  MedicineSearch = mongoose.model<IMedicineSearch>('MedicineSearch')
} catch (error) {
  MedicineSearch = mongoose.model<IMedicineSearch>('MedicineSearch', MedicineSearchSchema)
}

export default MedicineSearch;