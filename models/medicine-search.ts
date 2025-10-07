import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMedicineSearch extends Document {
  searchId: string;
  searchType: 'disease' | 'name' | 'sideEffects' | 'ingredient' | 'similar';
  query: string;
  result: string;
  createdAt: Date;
}

const MedicineSearchSchema: Schema = new Schema({
  searchId: { type: String, required: true, unique: true },
  searchType: { type: String, required: true, enum: ['disease', 'name', 'sideEffects', 'ingredient', 'similar'] },
  query: { type: String, required: true },
  result: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

let MedicineSearch: Model<IMedicineSearch>
try {
  MedicineSearch = mongoose.model<IMedicineSearch>('MedicineSearch')
} catch (error) {
  MedicineSearch = mongoose.model<IMedicineSearch>('MedicineSearch', MedicineSearchSchema)
}

export default MedicineSearch;