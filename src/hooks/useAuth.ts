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
    onSuccess: (data) => {
      const { user, token } = data.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Update Redux state
      dispatch(loginSuccess({ user, token }));

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
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
      const { user, token } = data.data;

      // Store token in localStorage
      localStorage.setItem("token", token);

      // Update Redux state
      dispatch(loginSuccess({ user, token }));

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
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
      // Clear token from localStorage
      localStorage.removeItem("token");

      // Update Redux state
      dispatch(logout());

      // Clear all queries
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      localStorage.removeItem("token");
      dispatch(logout());
      queryClient.clear();
    },
  });
};
