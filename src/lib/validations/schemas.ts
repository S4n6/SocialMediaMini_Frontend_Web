import * as yup from "yup";

// Login form validation
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// Register form validation
export const registerSchema = yup.object({
  fullname: yup
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .required("Display name is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
  birthDate: yup.string().required("Birthdate is required"),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Please select a valid gender")
    .required("Gender is required"),
});

// Signup form validation (matches your SignupForm component)
export const signupSchema = yup.object({
  fullName: yup
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  birthdate: yup.string().required("Birthdate is required"),
  // .test("age", "You must be at least 13 years old", function (value) {
  //   if (!value) return false;
  //   const today = new Date();
  //   const birthDate = new Date(value);
  //   const age = today.getFullYear() - birthDate.getFullYear();
  //   const monthDiff = today.getMonth() - birthDate.getMonth();

  //   console.log("Birthdate:", birthDate);

  //   if (
  //     monthDiff < 0 ||
  //     (monthDiff === 0 && today.getDate() < birthDate.getDate())
  //   ) {
  //     return age - 1 >= 13;
  //   }
  //   return age >= 13;
  // }),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Please select a valid gender")
    .required("Gender is required"),
});

// Post creation form validation
export const createPostSchema = yup.object({
  content: yup
    .string()
    .min(1, "Post content cannot be empty")
    .max(500, "Post content must be less than 500 characters")
    .required("Post content is required"),
});

// Profile update form validation
export const updateProfileSchema = yup.object({
  displayName: yup
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .required("Display name is required"),
  bio: yup.string().max(160, "Bio must be less than 160 characters").optional(),
});

// Comment form validation
export const commentSchema = yup.object({
  content: yup
    .string()
    .min(1, "Comment cannot be empty")
    .max(200, "Comment must be less than 200 characters")
    .required("Comment is required"),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type SignupFormData = yup.InferType<typeof signupSchema>;
export type CreatePostFormData = yup.InferType<typeof createPostSchema>;
export type UpdateProfileFormData = yup.InferType<typeof updateProfileSchema>;
export type CommentFormData = yup.InferType<typeof commentSchema>;
