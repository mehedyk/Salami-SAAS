import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const cardCreateSchema = z.object({
  eidType: z.enum(["eid_al_fitr", "eid_al_adha"]),
  theme: z.string().min(1, "Please select a theme"),
  audio: z.string().min(1, "Please select audio"),
  phone: z.string().min(11, "Invalid phone number").max(15),
  customMessage: z.string().min(1, "Message is required").max(500),
  recipientName: z.string().max(100).optional(),
});

export const userRequestSchema = z.object({
  type: z.enum(["EDIT_REQUEST", "TAKE_DOWN"]),
  cardId: z.string().optional(),
  details: z.string().max(1000).optional(),
});

export const notificationSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(["USER", "ALL_USERS"]),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
});

export const manualPaymentSchema = z.object({
  plan: z.enum(["ONE_TIME", "PREMIUM"]),
  amount: z.number().min(49),
  transactionId: z.string().min(8).max(50),
  senderNumber: z.string().min(11).max(15),
});

