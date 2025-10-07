export interface User {
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