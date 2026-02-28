import * as yup from 'yup';

/**
 * Shared strong-password rule — aligned with the PasswordPolicy type
 * used by the UI strength meter in SignupForm / ResetPasswordForm.
 * Re-used across all auth schemas that collect a new password.
 */
export const strongPasswordRules = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    'Password must contain at least one special character',
  )
  .required('Password is required');

export const loginSchema = yup.object({
  identifier: yup
    .string()
    .min(3, 'Email or username must be at least 3 characters')
    .required('Email or username is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registerSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .required('Display name is required'),
  userName: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    )
    .required('Username is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: strongPasswordRules,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

export const signupSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  birthdate: yup.string().required('Birthdate is required'),
  password: strongPasswordRules,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  gender: yup
    .string()
    .oneOf(['male', 'female'], 'Please select a valid gender')
    .required('Gender is required'),
});

export const resetPasswordSchema = yup.object({
  password: strongPasswordRules,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type SignupFormData = yup.InferType<typeof signupSchema>;
export type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;
