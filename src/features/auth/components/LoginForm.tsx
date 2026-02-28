'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/lib/validations/schemas';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentErrorBoundary } from '@/components/error-boundary';
import { RequestLoadingWrapper } from '@/components/loading';
import { useAuth } from '../hooks';
import { useErrorHandler, useFormErrorHandler } from '@/hooks';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { loginRateLimiter } from '../utils/rate-limiter';
import type { LoginFormData } from '../types';

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const {
    login,
    isLoggingIn,
    isLoggingInWithGoogle,
    forgotPassword,
    isForgotPasswordPending,
  } = useAuth();

  const { handleError } = useErrorHandler();
  const { handleSubmitError } = useFormErrorHandler('LoginForm');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    const rateLimitKey = data.identifier.toLowerCase();

    if (!loginRateLimiter.canAttempt(rateLimitKey)) {
      const waitMs = loginRateLimiter.getTimeUntilReset(rateLimitKey);
      const waitMin = Math.ceil(waitMs / 60_000);
      toast.error(
        `Too many login attempts. Please try again in ${waitMin} minute(s).`,
      );
      return;
    }

    try {
      loginRateLimiter.recordAttempt(rateLimitKey);

      // Call login and wait for result
      await login(data);

      // Success — clear the rate-limit counter
      loginRateLimiter.reset(rateLimitKey);
      toast.success('Login successful! Redirecting...');

      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);

      // Warn when running low on attempts
      const remaining = loginRateLimiter.getRemainingAttempts(rateLimitKey);
      if (remaining > 0 && remaining <= 2) {
        toast.warning(
          `${remaining} login attempt(s) remaining before lockout.`,
        );
      }

      // Nếu có lỗi field cụ thể từ server (như email/password sai)
      if (error?.response?.data?.fieldErrors) {
        const fieldErrors = error.response.data.fieldErrors;
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof LoginFormData, {
            type: 'server',
            message: String(message),
          });
        });
      } else if (error?.response?.data?.message) {
        // Hiển thị lỗi chung từ server
        toast.error(error.response.data.message);
      } else if (error?.message) {
        // Hiển thị lỗi từ client
        toast.error(error.message);
      } else {
        // Lỗi không xác định
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Google login clicked - integrate with Google OAuth');
      // await loginWithGoogle(googleCredential);
    } catch (error) {
      handleError(error, { action: 'google_login' });
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await forgotPassword(email);
      setIsForgotPasswordOpen(false);
    } catch (error) {
      handleError(error, { action: 'forgot_password' });
    }
  };

  // Create request state for loading wrapper
  const requestState = {
    isLoading: isLoggingIn || isSubmitting,
    error: null,
    isSuccess: false,
  };

  return (
    <ComponentErrorBoundary componentName="LoginForm">
      <div className="w-full max-w-6xl mx-auto h-screen flex flex-col lg:flex-row p-8">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex justify-center items-center flex-col p-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">SOCIAL MEDIA ST</h1>
              <p className="text-muted-foreground">
                Welcome Back! Please login to your account to continue.
              </p>
            </div>

            <RequestLoadingWrapper
              state={requestState}
              loadingText="Signing you in..."
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email or Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium">
                    Email or Username
                  </Label>
                  <Input
                    {...register('identifier')}
                    id="identifier"
                    type="text"
                    placeholder="Enter your email or username"
                    className={`${
                      errors.identifier
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    disabled={isLoggingIn}
                  />
                  {errors.identifier && (
                    <p className="text-red-500 text-sm">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`pr-10 ${
                        errors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : ''
                      }`}
                      disabled={isLoggingIn}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoggingIn}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      {...register('rememberMe')}
                      disabled={isLoggingIn}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-[#EA454C] hover:underline"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    disabled={isLoggingIn}
                  >
                    Forgot password?
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#EA454C] hover:bg-[#d63384] active:bg-[#b02a37]"
                  size="lg"
                  disabled={isLoggingIn || isSubmitting}
                >
                  {isLoggingIn || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Google Login */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingInWithGoogle || isLoggingIn}
                >
                  {isLoggingInWithGoogle ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FcGoogle size="20" className="mr-2" />
                      Continue with Google
                    </>
                  )}
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-[#EA454C] font-semibold hover:underline"
                  >
                    Sign up for free!
                  </Link>
                </p>
              </form>
            </RequestLoadingWrapper>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block lg:w-1/2">
          <div className="relative h-full">
            <Image
              src="/images/loginPage.png"
              alt="Social media illustration - people connecting and sharing"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          open={isForgotPasswordOpen}
          onOpenChange={setIsForgotPasswordOpen}
          onSubmit={handleForgotPassword}
          isLoading={isForgotPasswordPending}
        />
      </div>
    </ComponentErrorBoundary>
  );
};
