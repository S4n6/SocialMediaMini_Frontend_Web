// User types (aligned with API response)
export interface UserCount {
  posts: number;
  followers: number;
  following: number;
}

export interface User {
  id: string;
  fullName?: string | null; // display name
  userName: string; // API uses `userName`
  email: string;
  googleId?: string | null;
  dateOfBirth?: string | null; // API uses ISO date `dateOfBirth`
  birthDate?: string | null; // legacy alias
  phoneNumber?: string | null;
  avatar?: string | null; // API field for profile picture
  profilePicture?: string | null; // legacy alias
  bio?: string | null;
  location?: string | null;
  gender?: string | null;
  role?: string;
  websiteUrl?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  posts?: unknown[]; // keep generic for now
  followers?: unknown[];
  following?: unknown[];
  _count?: UserCount;
}
