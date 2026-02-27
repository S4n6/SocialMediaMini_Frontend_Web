// ───────────────────────────────────────────────────────────
// Barrel re-export – preserves every existing import path.
// Individual services now live in their own files for
// easier navigation, smaller diffs, and clearer ownership.
// ───────────────────────────────────────────────────────────

export { authService } from './auth.service';
export { usersService } from './users.service';
export { followService } from './social.service';
export { postsService } from './posts.service';
export { searchHistoryService } from './search.service';

// Composed object kept for the one consumer that imports `apiService` directly
import { authService } from './auth.service';
import { usersService } from './users.service';
import { followService } from './social.service';
import { postsService } from './posts.service';
import { searchHistoryService } from './search.service';

export const apiService = {
  auth: authService,
  users: usersService,
  social: followService,
  posts: postsService,
  search: searchHistoryService,
};
