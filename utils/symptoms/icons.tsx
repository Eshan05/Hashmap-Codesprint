import {
  Bone,
  Hand,
  HeartPulse,
  HelpCircle,
  LucideIcon,
  PersonStanding
} from 'lucide-react';
import { GiBarefoot, GiBrain, GiPeach, GiPelvisBone, GiStomach, GiTie } from "react-icons/gi";
import { IconType } from 'react-icons/lib';

export const categoryIcons: Record<string, LucideIcon | IconType> = {
  ALL: PersonStanding,
  COMMON: HelpCircle,
  SKIN: PersonStanding,
  HEAD: GiBrain,
  NECK: GiTie,
  CHEST: HeartPulse,
  ARMS: Hand,
  ABDOMEN: GiStomach,
  PELVIS: GiPelvisBone,
  BACK: Bone,
  BUTTOCKS: GiPeach,
  LEGS: GiBarefoot,
};