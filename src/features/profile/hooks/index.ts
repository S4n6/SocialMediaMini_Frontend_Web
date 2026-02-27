// ===== Profile hooks barrel =====
// Each module lives in its own file; this barrel just re-exports.

// Convenience hooks for follow / profile actions
export { useProfile, useFollowers, useFollowing } from './use-profile-actions';

// Unified user hook + legacy compat wrapper
export { useUser, useLegacyUser } from './useUser';
export type { UseUserOptions } from './useUser';

// Domain types
export * from './types';

// Query hooks, keys & configs
export * from './useUserQueries';

// Mutation hooks & configs
export * from './useUserMutations';

// Default export
export { useUser as default } from './useUser';
