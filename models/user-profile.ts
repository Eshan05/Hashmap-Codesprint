import mongoose, { Schema, type Document, type Model } from 'mongoose';

// UserProfile document intentionally does NOT duplicate fields that live on the
// main User model (models/user.ts). It references the User by ObjectId and
// holds profile-specific fields only (bio, location, medical profile, prefs,
// teams/projects metadata, privacy flags, etc.).

export interface IUserProfile extends Document {
  _id: string;
  user: string; // ObjectId ref to User

  // Public profile
  displayName?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  locale?: string | null;
  timezone?: string | null;

  // Address / geo
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  // GeoJSON point: { type: 'Point', coordinates: [lon, lat] }
  location?: { type: 'Point'; coordinates: [number, number] } | null;

  // App-specific arrays / structured data
  teams: Array<Record<string, any>>;
  projects: Array<Record<string, any>>;

  // Health-related
  medicalProfile: Record<string, any>;
  symptomPreferences: Record<string, any>;
  favouriteMedicines: Array<Record<string, any>>;
  savedSearches: Array<Record<string, any>>;

  // Settings / devices / metadata
  settings: Record<string, any>;
  deviceInfo: Array<Record<string, any>>;
  tags: string[];
  metadata: Record<string, any>;

  // Privacy & compliance
  isPublicProfile: boolean;
  consentToResearch: boolean;
  dataSharingOptIn: boolean;
  gdprDataRetentionUntil?: Date | null;
  deletionRequestedAt?: Date | null;
  deletedAt?: Date | null;

  // Soft-delete / activity
  isActive: boolean;

  // Timestamps (createdAt/updatedAt are provided by timestamps:true)
  createdAt: Date;
  updatedAt: Date;
}

const GeoPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      // [lon, lat]
      type: [Number],
      validate: {
        validator: function (v: number[]) {
          return Array.isArray(v) && v.length === 2;
        },
        message: 'location.coordinates must be [lon, lat]'
      }
    }
  },
  { _id: false }
);

const UserProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    displayName: { type: String, default: null },
    bio: { type: String, default: null },
    pronouns: { type: String, default: null },
    locale: { type: String, default: null },
    timezone: { type: String, default: null },

    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
    city: { type: String, default: null },
    region: { type: String, default: null },
    postalCode: { type: String, default: null },
    countryCode: { type: String, default: null },
    location: { type: GeoPointSchema, default: null },

    teams: { type: Array, default: [] },
    projects: { type: Array, default: [] },

    medicalProfile: { type: Schema.Types.Mixed, default: {} },
    symptomPreferences: { type: Schema.Types.Mixed, default: {} },
    favouriteMedicines: { type: Array, default: [] },
    savedSearches: { type: Array, default: [] },

    settings: { type: Schema.Types.Mixed, default: {} },
    deviceInfo: { type: Array, default: [] },
    tags: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },

    isPublicProfile: { type: Boolean, default: false },
    consentToResearch: { type: Boolean, default: false },
    dataSharingOptIn: { type: Boolean, default: false },
    gdprDataRetentionUntil: { type: Date, default: null },
    deletionRequestedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 2dsphere index for geo queries
UserProfileSchema.index({ location: '2dsphere' });

// Text index for fast fuzzy searches across displayName and bio
UserProfileSchema.index({ displayName: 'text', bio: 'text', tags: 1 });

// Pre-save hook to ensure updatedAt is refreshed when using some update flows
UserProfileSchema.pre('save', function (next) {
  // updatedAt comes from timestamps option
  (this as any).updatedAt = new Date();
  next();
});

// Export model safely (avoid OverwriteModelError in watch/dev)
let UserProfile: Model<IUserProfile>;
try {
  UserProfile = mongoose.model<IUserProfile>('UserProfile');
} catch (e) {
  UserProfile = mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
}

export default UserProfile;
