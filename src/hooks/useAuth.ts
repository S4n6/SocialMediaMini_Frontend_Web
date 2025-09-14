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

export const useCurrentUser = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
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
    onSuccess: async (response) => {
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
      await TokenManager.setToken(accessToken);

      // Update Redux state
      dispatch(loginSuccess({ user, token: accessToken }));

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      router.push("/");
    },
    onError: (error: unknown) => {
      console.error("Login error:", error);
    },
  });
};

export const useGoogleLogin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return authService.loginWithGoogle();
    },
    onSuccess: async (response) => {
      console.log("Google login response:", response);

      const { user, accessToken } = response;
      console.log("Google login successful:", user, accessToken);

      // Store token using TokenManager
      TokenManager.setToken(accessToken);

      // Update Redux state
      dispatch(loginSuccess({ user, token: accessToken }));

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      // Redirect to home page
      router.push("/");
    },
    onError: (error) => {
      console.error("Google login failed:", error);
      // You can add toast notification here
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
      console.error("Registration error:", error);
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      // Use TokenManager to clear tokens
      await TokenManager.clearTokens();

      // Clear Redux state
      dispatch(logout());

      // Clear all React Query cache
      queryClient.clear();
      router.push("/login");
    },
    onError: async () => {
      // Even on error, clear local state
      await TokenManager.clearTokens();
      dispatch(logout());
      queryClient.clear();
      router.push("/login");
    },
  });
};

export const useVerifyEmail = (token: string) => {
  return useMutation({
    mutationFn: () => authService.verifyEmail(token),
  });
}
