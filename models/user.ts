import mongoose, { Schema, type Document, type Model } from 'mongoose';

interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
  role: string;
  banned: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date, default: null },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  twoFactorEnabled: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  banned: { type: Boolean, default: false },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

let User: Model<IUser>;
try {
  User = mongoose.model<IUser>('User');
} catch (e) {
  User = mongoose.model<IUser>('User', UserSchema);
}

export default User;