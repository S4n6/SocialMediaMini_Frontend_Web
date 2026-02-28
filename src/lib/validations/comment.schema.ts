import * as yup from 'yup';

export const commentSchema = yup.object({
  content: yup
    .string()
    .min(1, 'Comment cannot be empty')
    .max(200, 'Comment must be less than 200 characters')
    .required('Comment is required'),
});

export type CommentFormData = yup.InferType<typeof commentSchema>;
