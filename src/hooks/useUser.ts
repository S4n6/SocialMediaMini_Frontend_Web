import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { User } from "@/types";
import { UserService } from "@/services/users.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser as updateUserAction } from "@/store/slices/authSlice";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export function useCurrentUser() {
  return useQuery<User | null, Error>({
    queryKey: CURRENT_USER_QUERY_KEY as QueryKey,
    queryFn: async () => {
      const res = await authService.getCurrentUser();
      return res.data ?? null;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);

  return useMutation<User, Error, Partial<User>>({
    mutationFn: async (data: Partial<User>) => {
      if (!currentUser?.id) throw new Error("No current user id available");
      const updated = await UserService.updateProfile(currentUser.id, data);
      return updated;
    },
    onSuccess: (updated: User) => {
      // update cached current user
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY as QueryKey, updated);
      // update redux auth slice so UI using redux is in sync
      dispatch(updateUserAction({ data: updated }));
      // invalidate user lists
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery<User[], Error>({
    queryKey: ["users", "search", query] as QueryKey,
    queryFn: async () => {
      if (!query) return [];
      const results = await UserService.searchUsers(query);
      // results has shape { data: User[], message, success, pagination }
      console.log("Search results------:", results);
      return results.data ?? [];
    },
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetUserById(userId: string) {
  return useQuery<User, Error>({
    queryKey: ["users", userId] as QueryKey,
    queryFn: async () => {
      if (!userId) throw new Error("No userId provided");
      const res = await UserService.getUserById(userId);
      return res.data as User;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
