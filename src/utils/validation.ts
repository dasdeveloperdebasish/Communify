import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title must be under 150 characters'),
  body: z
    .string()
    .min(1, 'Body is required')
    .min(10, 'Body must be at least 10 characters')
    .max(5000, 'Body must be under 5000 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CreatePostFormData = z.infer<typeof createPostSchema>;
