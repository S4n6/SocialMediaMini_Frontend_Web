// Legacy post type - will be deprecated after migration to domain types
export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
