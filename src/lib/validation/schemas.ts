import { z } from 'zod';
import { isValidSaudiPhone } from '@/lib/utils/phone';

/**
 * Schemas are built from a translator function (`useTranslations('validation')`)
 * so Zod error messages render in whichever locale is active — Zod itself has
 * no access to React context, so messages can't be static strings.
 */
type T = (key: string) => string;

export function makePhoneSchema(t: T) {
  return z
    .string()
    .min(1, t('phoneRequired'))
    .refine(isValidSaudiPhone, t('phoneInvalid'));
}

export function makeOtpSchema(t: T) {
  return z.object({
    code: z
      .string()
      .length(6, t('otpLength'))
      .regex(/^\d{6}$/, t('otpDigitsOnly')),
  });
}

export function makeLoginSchema(t: T) {
  return z.object({
    phone: makePhoneSchema(t),
  });
}

export function makeRegisterSchema(t: T) {
  return z.object({
    firstName: z.string().min(2, t('firstNameShort')),
    lastName: z.string().min(2, t('lastNameShort')),
    email: z.string().email(t('emailInvalid')),
    phone: makePhoneSchema(t),
  });
}

export function makeContactSchema(t: T) {
  return z.object({
    name: z.string().min(2, t('nameShort')),
    phone: makePhoneSchema(t),
    email: z.string().email(t('emailInvalid')),
    message: z.string().min(10, t('messageShort')),
  });
}

export function makeReviewSchema(t: T) {
  return z.object({
    rating: z.number().min(1, t('ratingRequired')).max(5),
    comment: z.string().min(10, t('commentShort')).max(1000),
  });
}

export function makeProfileUpdateSchema() {
  return z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
  });
}

export function makeChangePhoneSchema(t: T) {
  return z.object({
    newPhone: makePhoneSchema(t),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof makeLoginSchema>>;
export type RegisterFormValues = z.infer<ReturnType<typeof makeRegisterSchema>>;
export type ContactFormValues = z.infer<ReturnType<typeof makeContactSchema>>;
export type ReviewFormValues = z.infer<ReturnType<typeof makeReviewSchema>>;
export type ProfileUpdateValues = z.infer<ReturnType<typeof makeProfileUpdateSchema>>;
export type ChangePhoneValues = z.infer<ReturnType<typeof makeChangePhoneSchema>>;
