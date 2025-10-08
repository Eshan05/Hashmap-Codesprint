import {
  abdomenSubCats,
  allAbdomenSymptoms,
  upperAbdomenSymptoms,
  lowerAbdomenSymptoms,
  epigastricSymptoms,
} from './abdomen';
import {
  armSubCats,
  allArmsSymptoms,
  upperArmSymptoms,
  forearmSymptoms,
  handSymptoms,
  shoulderSymptoms,
  armpitSymptoms,
  elbowsSymptoms,
  wristSymptoms,
  fingersSymptoms,
} from './arms';
import {
  backSubCats,
  allBackSymptoms,
  upperBackSymptoms,
  lowerBackSymptoms,
  flankSymptoms,
  tailboneSymptoms,
} from './back';
import {
  buttocksSubCats,
  allButtocksSymptoms,
  hipSymptoms as buttocksHipSymptoms,
  rectumSymptoms,
} from './buttocks';
import {
  chestSubCats,
  allChestSymptoms,
  upperChestSymptoms,
  sternumSymptoms,
  breastSymptoms,
} from './chest';
import {
  headSubCats,
  allHeadSymptoms,
  scalpSymptoms,
  foreheadSymptoms,
  eyesSymptoms,
  noseSymptoms,
  earsSymptoms,
  faceSymptoms,
  mouthSymptoms,
  jawSymptoms,
} from './head';
import {
  legsSubCats,
  allLegsSymptoms,
  thighSymptoms,
  hamstringSymptoms,
  kneeSymptoms,
  poplitealSymptoms,
  shinSymptoms,
  ankleSymptoms,
  footSymptoms,
  toesSymptoms,
} from './legs';
import { neckSymptoms } from './neck';
import {
  pelvicSubCats,
  allPelvicSymptoms,
  hipSymptoms as pelvicHipSymptoms,
  groinSymptoms,
  suprapubicSymptoms,
  genitalSymptoms,
} from './pelvis';
import { skinSymptoms } from './skin';
import { generalSymptoms } from './general';

export { abdomenSubCats, allAbdomenSymptoms, upperAbdomenSymptoms, lowerAbdomenSymptoms };
export { armSubCats, allArmsSymptoms, upperArmSymptoms, forearmSymptoms, handSymptoms };
export { backSubCats, allBackSymptoms, upperBackSymptoms, lowerBackSymptoms, flankSymptoms };
export { buttocksSubCats, allButtocksSymptoms, buttocksHipSymptoms, rectumSymptoms };
export { chestSubCats, allChestSymptoms, upperChestSymptoms, sternumSymptoms, breastSymptoms };
export { headSubCats, allHeadSymptoms, scalpSymptoms, foreheadSymptoms, eyesSymptoms, noseSymptoms, earsSymptoms, faceSymptoms, mouthSymptoms, jawSymptoms };
export { legsSubCats, allLegsSymptoms, thighSymptoms, hamstringSymptoms, kneeSymptoms, poplitealSymptoms, shinSymptoms, ankleSymptoms, footSymptoms, toesSymptoms };
export { neckSymptoms };
export { pelvicSubCats, allPelvicSymptoms, pelvicHipSymptoms, groinSymptoms, suprapubicSymptoms, genitalSymptoms };
export { skinSymptoms };
export { generalSymptoms };

export const topLevelSymptoms = {
  ALL: 'All Symptoms',
  COMMON: 'General Symptoms',
  SKIN: 'Skin Symptoms',
  HEAD: 'Head Symptoms',
  NECK: 'Neck Symptoms',
  CHEST: 'Chest Symptoms',
  ARMS: 'Arms Symptoms',
  ABDOMEN: 'Abdomen Symptoms',
  PELVIS: 'Pelvis Symptoms',
  BACK: 'Back Symptoms',
  BUTTOCKS: 'Buttocks Symptoms',
  LEGS: 'Legs Symptoms',
}

export interface SymptomCategory {
  displayName: string;
  subCategories?: Record<string, SymptomSubCategory>;
  symptoms?: string[];
}

export interface SymptomSubCategory {
  displayName: string;
  symptoms: string[];
}

export const structuredSymptoms: Record<string, SymptomCategory> = {
  HEAD: {
    displayName: topLevelSymptoms.HEAD,
    symptoms: allHeadSymptoms,
    subCategories: {
      SCALP: { displayName: headSubCats.SCALP, symptoms: scalpSymptoms },
      FOREHEAD: { displayName: headSubCats.FOREHEAD, symptoms: foreheadSymptoms },
      EYES: { displayName: headSubCats.EYES, symptoms: eyesSymptoms },
      NOSE: { displayName: headSubCats.NOSE, symptoms: noseSymptoms },
      EARS: { displayName: headSubCats.EARS, symptoms: earsSymptoms },
      FACE: { displayName: headSubCats.FACE, symptoms: faceSymptoms },
      MOUTH: { displayName: headSubCats.MOUTH, symptoms: mouthSymptoms },
      JAW: { displayName: headSubCats.JAW, symptoms: jawSymptoms },
    },
  },
  NECK: {
    displayName: topLevelSymptoms.NECK,
    symptoms: neckSymptoms,
  },
  CHEST: {
    displayName: topLevelSymptoms.CHEST,
    symptoms: allChestSymptoms,
    subCategories: {
      UPPERCHEST: { displayName: chestSubCats.UPPERCHEST, symptoms: upperChestSymptoms },
      STERNUM: { displayName: chestSubCats.STERNUM, symptoms: sternumSymptoms },
      BREAST: { displayName: chestSubCats.BREAST, symptoms: breastSymptoms },
    },
  },
  ARMS: {
    displayName: topLevelSymptoms.ARMS,
    symptoms: allArmsSymptoms,
    subCategories: {
      SHOULDER: { displayName: armSubCats.SHOULDER, symptoms: shoulderSymptoms },
      ARMPIT: { displayName: armSubCats.ARMPIT, symptoms: armpitSymptoms },
      UPPERARM: { displayName: armSubCats.UPPERARM, symptoms: upperArmSymptoms },
      ELBOW: { displayName: armSubCats.ELBOW, symptoms: elbowsSymptoms },
      FOREARM: { displayName: armSubCats.FOREARM, symptoms: forearmSymptoms },
      WRIST: { displayName: armSubCats.WRIST, symptoms: wristSymptoms },
      HAND: { displayName: armSubCats.HAND, symptoms: handSymptoms },
      FINGERS: { displayName: armSubCats.FINGERS, symptoms: fingersSymptoms },
    },
  },
  ABDOMEN: {
    displayName: topLevelSymptoms.ABDOMEN,
    symptoms: allAbdomenSymptoms,
    subCategories: {
      UPPERABDOMEN: { displayName: abdomenSubCats.UPPERABDOMEN, symptoms: upperAbdomenSymptoms },
      EPIGASTRIC: { displayName: abdomenSubCats.EPIGASTRIC, symptoms: epigastricSymptoms },
      LOWERABDOMEN: { displayName: abdomenSubCats.LOWERABDOMEN, symptoms: lowerAbdomenSymptoms },
    },
  },
  PELVIS: {
    displayName: topLevelSymptoms.PELVIS,
    symptoms: allPelvicSymptoms,
    subCategories: {
      PELVICHIP: { displayName: pelvicSubCats.PELVICHIP, symptoms: pelvicHipSymptoms },
      GROIN: { displayName: pelvicSubCats.GROIN, symptoms: groinSymptoms },
      SUPRAPUBIC: { displayName: pelvicSubCats.SUPRAPUBIC, symptoms: suprapubicSymptoms },
      GENITALS: { displayName: pelvicSubCats.GENITALS, symptoms: genitalSymptoms },
    },
  },
  BACK: {
    displayName: topLevelSymptoms.BACK,
    symptoms: allBackSymptoms,
    subCategories: {
      UPPERBACK: { displayName: backSubCats.UPPERBACK, symptoms: upperBackSymptoms },
      LOWERBACK: { displayName: backSubCats.LOWERBACK, symptoms: lowerBackSymptoms },
      FLANK: { displayName: backSubCats.FLANK, symptoms: flankSymptoms },
    },
  },
  BUTTOCKS: {
    displayName: topLevelSymptoms.BUTTOCKS,
    symptoms: allButtocksSymptoms,
    subCategories: {
      HIP: { displayName: buttocksSubCats.HIP, symptoms: buttocksHipSymptoms },
      RECTUM: { displayName: buttocksSubCats.RECTUM, symptoms: rectumSymptoms },
    },
  },
  LEGS: {
    displayName: topLevelSymptoms.LEGS,
    symptoms: allLegsSymptoms,
    subCategories: {
      THIGHS: { displayName: legsSubCats.THIGHS, symptoms: thighSymptoms },
      HAMSTRING: { displayName: legsSubCats.HAMSTRING, symptoms: hamstringSymptoms },
      KNEE: { displayName: legsSubCats.KNEE, symptoms: kneeSymptoms },
      POPLITEAL: { displayName: legsSubCats.POPLITEAL, symptoms: poplitealSymptoms },
      SHIN: { displayName: legsSubCats.SHIN, symptoms: shinSymptoms },
      ANKLE: { displayName: legsSubCats.ANKLE, symptoms: ankleSymptoms },
      FOOT: { displayName: legsSubCats.FOOT, symptoms: footSymptoms },
      TOES: { displayName: legsSubCats.TOES, symptoms: toesSymptoms },
    },
  },
  SKIN: {
    displayName: topLevelSymptoms.SKIN,
    symptoms: skinSymptoms,
  },
  COMMON: {
    displayName: topLevelSymptoms.COMMON,
    symptoms: generalSymptoms,
  },
};

const allSymptomsList: string[] = Object.values(structuredSymptoms).flatMap(category => category.symptoms || []);
export const allSymptoms = [...new Set(allSymptomsList)];