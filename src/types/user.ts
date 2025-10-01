// Legacy user type - will be deprecated after migration to domain types
export interface User {
  id: string;
  userName: string;
  email: string;
  fullName?: string;
  avatar?: string;
}
