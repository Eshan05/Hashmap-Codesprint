import mongoose, { Schema, type Document, type Model } from 'mongoose';

interface MedicalCondition { code?: string; name?: string; active?: boolean; onsetYear?: number | null }
interface Allergy { substanceCode?: string; name?: string; severity?: 'mild' | 'moderate' | 'severe' | 'unknown'; confirmed?: boolean }
interface Medication { name?: string; rxNorm?: string; dosage?: string | null; current?: boolean }
interface FamilyHistoryItem { relation?: string; conditionCode?: string; name?: string; ageAtOnset?: number | null }
interface Immunization { code?: string; name?: string; date?: string }
interface MentalHealth { diagnoses?: Array<{ code?: string; name?: string }>; isUnderCare?: boolean }
interface Pregnancy { status?: 'pregnant' | 'not_pregnant' | 'unknown'; dueDate?: string | null }
interface NotesMetadata { flags?: string[]; lastUpdatedBy?: string | null }
interface LocaleHints { measuredAt?: Date; timezoneOffset?: number }

export interface IUserProfile extends Document {
  _id: string;
  user: string;

  // Public profile
  displayName?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  pronounsVerified?: boolean;
  locale?: string | null;
  timezone?: string | null;
  profileVisibility?: 'public' | 'private' | 'members-only';

  city?: string | null;
  countryCode?: string | null;
  location?: { type: 'Point'; coordinates: [number, number] } | null;

  medicalProfile: {
    dob?: string | null;
    sex?: 'male' | 'female' | 'other' | 'unknown' | null;
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
    chronicConditions?: MedicalCondition[];
    allergies?: Allergy[];
    medications?: Medication[];
    familyHistory?: FamilyHistoryItem[];
    immunizations?: Immunization[];
    pregnancy?: Pregnancy | null;
    mentalHealth?: MentalHealth | null;
    notesMetadata?: NotesMetadata;
    clinicalNotes?: { stored: boolean };
  };

  symptomPreferences: Record<string, any>;
  favouriteMedicines: Array<Record<string, any>>;
  savedSearches: Array<Record<string, any>>;

  tags: string[];
  metadata: Record<string, any>;

  lastPrivacyConsentAt?: Date | null;
  healthDataConsentVersion?: string | null;
  anonymizedId?: string | null;
  searchAliases?: string[];
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  localeHints?: LocaleHints | null;

  isPublicProfile: boolean;
  consentToResearch: boolean;
  gdprDataRetentionUntil?: Date | null;
  deletionRequestedAt?: Date | null;
  deletedAt?: Date | null;

  isActive: boolean;
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

const MedicalConditionSchema = new Schema({ code: String, name: String, active: Boolean, onsetYear: Number }, { _id: false });
const AllergySchema = new Schema({ substanceCode: String, name: String, severity: String, confirmed: Boolean }, { _id: false });
const MedicationSchema = new Schema({ name: String, rxNorm: String, dosage: String, current: Boolean }, { _id: false });
const FamilyHistorySchema = new Schema({ relation: String, conditionCode: String, name: String, ageAtOnset: Number }, { _id: false });
const ImmunizationSchema = new Schema({ code: String, name: String, date: String }, { _id: false });
const MentalHealthSchema = new Schema({ diagnoses: { type: [Object], default: [] }, isUnderCare: { type: Boolean, default: false } }, { _id: false });
const PregnancySchema = new Schema({ status: { type: String, enum: ['pregnant', 'not_pregnant', 'unknown'], default: 'unknown' }, dueDate: { type: String, default: null } }, { _id: false });
const NotesMetadataSchema = new Schema({ flags: { type: [String], default: [] }, lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null } }, { _id: false });
const EmergencyContactSchema = new Schema({ name: String, phone: String, relation: String }, { _id: false });
const AvatarVariantSchema = new Schema({ color: String, emoji: String }, { _id: false });
const LocaleHintsSchema = new Schema({ measuredAt: Date, timezoneOffset: Number }, { _id: false });
const RecoveryEmailSchema = new Schema({ emailHash: String, label: String }, { _id: false });
const AccessibilityNeedSchema = new Schema({ key: String, description: String }, { _id: false });
const OnboardingHealthSummarySchema = new Schema({ completed: Boolean, summaryCode: String }, { _id: false });

const UserProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    displayName: { type: String, default: null },
    bio: { type: String, default: null },
    pronouns: { type: String, default: null },
    pronounsVerified: { type: Boolean, default: false },
    locale: { type: String, default: null },
    timezone: { type: String, default: null },
    profileVisibility: { type: String, enum: ['public', 'private', 'members-only'], default: 'private' },

    city: { type: String, default: null },
    countryCode: { type: String, default: null },
    location: { type: GeoPointSchema, default: null },

    // teams/projects removed for single-user app

    medicalProfile: {
      dob: { type: String, default: null },
      sex: { type: String, enum: ['male', 'female', 'other', 'unknown'], default: 'unknown' },
      bloodType: { type: String, default: null },
      chronicConditions: { type: [MedicalConditionSchema], default: [] },
      allergies: { type: [AllergySchema], default: [] },
      medications: { type: [MedicationSchema], default: [] },
      familyHistory: { type: [FamilyHistorySchema], default: [] },
      immunizations: { type: [ImmunizationSchema], default: [] },
      pregnancy: { type: PregnancySchema, default: null },
      mentalHealth: { type: MentalHealthSchema, default: null },
      notesMetadata: { type: NotesMetadataSchema, default: {} },
      clinicalNotes: { stored: { type: Boolean, default: false } }
    },

    symptomPreferences: { type: Schema.Types.Mixed, default: {} },
    favouriteMedicines: { type: Array, default: [] },
    savedSearches: { type: Array, default: [] },

    tags: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },

    // suggested additions
    lastPrivacyConsentAt: { type: Date, default: null },
    healthDataConsentVersion: { type: String, default: null },
    anonymizedId: { type: String, index: true, default: null },
    searchAliases: { type: [String], default: [] },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    localeHints: { type: LocaleHintsSchema, default: null },

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

UserProfileSchema.index({ location: '2dsphere' });
UserProfileSchema.index({ displayName: 'text', bio: 'text', searchAliases: 'text', tags: 1 });

// Pre-save hook to ensure updatedAt is refreshed when using some update flows
UserProfileSchema.pre('save', function (next) {
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
