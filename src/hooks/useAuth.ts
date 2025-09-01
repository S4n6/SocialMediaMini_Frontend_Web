import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/schemas";
import { TokenManager } from "@/lib/tokenManager";
import { useRouter } from "next/navigation";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

/**
 * Get current user with React Query
 * Only runs if user is authenticated (has token)
 */
export const useCurrentUser = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated && !!TokenManager.getToken(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on 401 (auth errors)
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      )
        return false;
      return failureCount < 2;
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginFormData) => {
      return authService.login(credentials);
    },
    onSuccess: (response) => {
      console.log("Login response:", response);

      if (
        "requiresEmailVerification" in response.data &&
        response.data.requiresEmailVerification
      ) {
        console.log("Email verification required");
        return;
      }

      const { user, accessToken } = response.data;
      console.log("Login successful:", user, accessToken);

      // Use TokenManager instead of direct localStorage
      TokenManager.setToken(accessToken);

      // Update Redux state
      dispatch(loginSuccess({ user, token: accessToken }));

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      router.push("/");
    },
    onError: (error: unknown) => {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterFormData) => {
      return authService.register(userData);
    },
    onSuccess: (data) => {
      console.log("Registration response:", data);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      if (data.data.requiresEmailVerification) {
        window.location.href = "/login";
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Use TokenManager to clear tokens
      TokenManager.clearTokens();

      // Clear Redux state
      dispatch(logout());

      // Clear all React Query cache
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: () => {
      // Even on error, clear local state
      TokenManager.clearTokens();
      dispatch(logout());
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};
