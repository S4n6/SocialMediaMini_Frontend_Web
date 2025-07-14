"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";
import { useLogin } from "@/hooks/useAuth";
import { Button, Input } from "@/components";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      router.push("/feed");
    } catch (error: unknown) {
      // Set form errors if validation fails
      const errorResponse = error as {
        response?: { data?: { errors?: Record<string, string> } };
      };
      if (errorResponse.response?.data?.errors) {
        Object.entries(errorResponse.response.data.errors).forEach(
          ([field, message]) => {
            setError(field as keyof LoginFormData, {
              type: "server",
              message: message as string,
            });
          }
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          {loginMutation.isError && (
            <div className="text-red-600 text-sm text-center">
              Login failed. Please try again.
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || loginMutation.isPending}
          >
            {isSubmitting || loginMutation.isPending
              ? "Signing in..."
              : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
