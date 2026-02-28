// Barrel — re-exports every validation schema and type.
// Import from here when you need cross-domain access, or import
// directly from the domain file when keeping dependencies explicit.
//
//   import { loginSchema }       from '@/lib/validations';          // barrel
//   import { loginSchema }       from '@/lib/validations/auth.schema'; // direct

export * from './auth.schema';
export * from './post.schema';
export * from './profile.schema';
export * from './comment.schema';
