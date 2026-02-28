'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema } from '@/lib/validations/auth.schema';
import type { ResetPasswordFormData } from '@/lib/validations/auth.schema';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { ComponentErrorBoundary } from '@/components/error-boundary';
import { RequestLoadingWrapper } from '@/components/loading';
import { useAuth } from '../hooks';
import { useErrorHandler, useFormErrorHandler } from '@/hooks';

export const ResetPasswordForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { resetPassword, isResetPasswordPending } = useAuth();
  const { handleError } = useErrorHandler();
  const { handleValidationError, handleSubmitError } =
    useFormErrorHandler('ResetPasswordForm');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      handleValidationError(new Error('Reset token is missing'), 'token');
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      handleSubmitError(error);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { score: 0, text: '', color: '' },
      { score: 1, text: 'Very Weak', color: 'text-red-500' },
      { score: 2, text: 'Weak', color: 'text-orange-500' },
      { score: 3, text: 'Fair', color: 'text-yellow-500' },
      { score: 4, text: 'Good', color: 'text-blue-500' },
      { score: 5, text: 'Strong', color: 'text-green-500' },
    ];

    return levels[score] || levels[0];
  };

  const passwordStrength = getPasswordStrength(watchedPassword || '');

  // Create request state for loading wrapper
  const requestState = {
    isLoading: isResetPasswordPending || isSubmitting,
    error: null,
    isSuccess,
  };

  if (isSuccess) {
    return (
      <ComponentErrorBoundary componentName="ResetPasswordSuccess">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been successfully updated. You will be
                redirected to the login page shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-[#EA454C] hover:bg-[#d63384]"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </ComponentErrorBoundary>
    );
  }

  if (!token) {
    return (
      <ComponentErrorBoundary componentName="ResetPasswordInvalidToken">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Please
                request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-[#EA454C] hover:bg-[#d63384]"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary componentName="ResetPasswordForm">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-[#EA454C]" />
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it&apos;s strong and
              secure.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <RequestLoadingWrapper
              state={requestState}
              loadingText="Updating your password..."
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      className={`pr-10 ${
                        errors.password
                          ? 'border-red-500 focus:ring-red-500'
                          : ''
                      }`}
                      disabled={isResetPasswordPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isResetPasswordPending}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {passwordStrength.score > 0 && (
                    <div className={`text-sm ${passwordStrength.color}`}>
                      Strength: {passwordStrength.text}
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      className={`pr-10 ${
                        errors.confirmPassword
                          ? 'border-red-500 focus:ring-red-500'
                          : ''
                      }`}
                      disabled={isResetPasswordPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isResetPasswordPending}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-[#EA454C] hover:bg-[#d63384] active:bg-[#b02a37]"
                  size="lg"
                  disabled={isResetPasswordPending || isSubmitting}
                >
                  {isResetPasswordPending || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>

                {/* Back to Login */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/login')}
                  disabled={isResetPasswordPending}
                >
                  Back to Login
                </Button>
              </form>
            </RequestLoadingWrapper>
          </CardContent>
        </Card>
      </div>
    </ComponentErrorBoundary>
  );
};
