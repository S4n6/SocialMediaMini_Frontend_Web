import * as yup from 'yup';

export const createPostSchema = yup.object({
  content: yup
    .string()
    .min(1, 'Post content cannot be empty')
    .max(500, 'Post content must be less than 500 characters')
    .required('Post content is required'),
});

export type CreatePostFormData = yup.InferType<typeof createPostSchema>;
