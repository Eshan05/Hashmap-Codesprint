import mongoose, { Schema, Document, Model } from 'mongoose';

interface exe {
  name: string,
  set: number,
  rep: number
}

const Ex: Schema = new mongoose.Schema({
  name: {
    type: String, required: true,
  },
  set: { type: Number, required: true, },
  rep: {
    type: Number, required: true,
  },
});

let Exe: Model<exe>;
try {
  Exe = mongoose.model<exe>('Exce');
} catch (e) {
  Exe = mongoose.model<exe>('Exce', Ex);
}

export default Exe;