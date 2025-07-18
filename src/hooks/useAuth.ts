import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAppDispatch } from "@/hooks/redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "@/store/slices/authSlice";
import type {
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations/schemas";

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginFormData) => {
      dispatch(loginStart());
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
      const { user, accessToken } = response.data as {
        user: any;
        accessToken: string;
      };

      console.log("Login successful:", user, accessToken);

      // Store token in localStorage
      localStorage.setItem("token", accessToken);

      // Store token in cookies for middleware access
      document.cookie = `auth-token=${accessToken}; path=/; max-age=${
        7 * 24 * 60 * 60
      }; secure; samesite=strict`;

      // Update Redux state
      dispatch(loginSuccess({ user, token: accessToken }));

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });

      window.location.href = "/";
    },
    onError: (error: unknown) => {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const message = errorResponse.response?.data?.message || "Login failed";
      dispatch(loginFailure(message));
    },
  });
};

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterFormData) => {
      dispatch(loginStart());

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
      const message =
        errorResponse.response?.data?.message || "Registration failed";
      dispatch(loginFailure(message));
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem("token");

      document.cookie =
        "auth-token=; path=/; max-age=0; secure; samesite=strict";
      dispatch(logout());

      queryClient.clear();

      window.location.href = "/login";
    },
    onError: () => {
      localStorage.removeItem("token");
      dispatch(logout());
      queryClient.clear();
    },
  });
};
