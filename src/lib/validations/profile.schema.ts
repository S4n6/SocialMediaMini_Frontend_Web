import * as yup from 'yup';

export const updateProfileSchema = yup.object({
  displayName: yup
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters')
    .required('Display name is required'),
  bio: yup.string().max(160, 'Bio must be less than 160 characters').optional(),
});

export type UpdateProfileFormData = yup.InferType<typeof updateProfileSchema>;
