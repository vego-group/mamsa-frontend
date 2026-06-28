import { z } from 'zod';
import { isValidSaudiPhone } from '@/lib/utils/phone';

export const phoneSchema = z
  .string()
  .min(1, 'رقم الجوال مطلوب')
  .refine(isValidSaudiPhone, 'رقم جوال سعودي غير صحيح');

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'الرمز يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'الرمز يجب أن يحتوي على أرقام فقط'),
});

export const loginSchema = z.object({
  phone: phoneSchema,
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول قصير جدًا'),
  lastName: z.string().min(2, 'الاسم الأخير قصير جدًا'),
  email: z.string().email('بريد إلكتروني غير صحيح'),
  phone: phoneSchema,
});

export const contactSchema = z.object({
  name: z.string().min(2, 'الاسم قصير جدًا'),
  phone: phoneSchema,
  email: z.string().email('بريد إلكتروني غير صحيح'),
  message: z.string().min(10, 'الرسالة قصيرة جدًا'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'أضف تقييمًا').max(5),
  comment: z.string().min(10, 'التعليق قصير جدًا').max(1000),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
});

export const changePhoneSchema = z.object({
  newPhone: phoneSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
export type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;
export type ChangePhoneValues = z.infer<typeof changePhoneSchema>;
