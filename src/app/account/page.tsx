'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Phone, Trash2, ChevronLeft, User as UserIcon, Check,
  Heart, CreditCard, CalendarCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi, authApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { formatPhoneDisplay } from '@/lib/utils/phone';
import type { User } from '@/types';

export default function AccountPage() {
  const t = useTranslations('account');
  const tc = useTranslations('common');
  const router = useRouter();
  const { user: storedUser, updateUser, logout } = useAuthStore();
  const [user, setUser] = useState<User | null>(storedUser);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const QUICK_LINKS = [
    { href: '/my-reservations', label: t('quickLinks.reservations'), desc: t('quickLinks.reservationsDesc'), icon: CalendarCheck },
    { href: '/favorites', label: t('quickLinks.favorites'), desc: t('quickLinks.favoritesDesc'), icon: Heart },
    { href: '/account/payment-methods', label: t('quickLinks.paymentMethods'), desc: t('quickLinks.paymentMethodsDesc'), icon: CreditCard },
  ];

  useEffect(() => {
    accountApi.me().then(setUser).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await accountApi.updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await accountApi.deleteAccount();
      await authApi.logout();
      logout();
      router.push('/');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return <div className="container mx-auto p-10 text-center text-brand-muted">{tc('loading')}</div>;

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` || '؟';

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-ink md:text-3xl">{t('title')}</h1>

      {/* Profile summary */}
      <Card className="mb-4 flex items-center gap-4 overflow-hidden p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-primary text-2xl font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-bold text-brand-ink">{user.firstName} {user.lastName}</div>
          <div className="truncate text-sm text-brand-muted">{user.email}</div>
          <div className="text-sm text-brand-muted" dir="ltr">{formatPhoneDisplay(user.phone)}</div>
        </div>
      </Card>

      {/* Quick links */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group rounded-2xl border border-brand-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-md"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
              <q.icon className="h-5 w-5" />
            </div>
            <div className="font-bold text-brand-ink">{q.label}</div>
            <div className="text-xs text-brand-muted">{q.desc}</div>
          </Link>
        ))}
      </div>

      {/* Profile info */}
      <Card className="mb-4 space-y-4 p-6">
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-brand-primary" />
          <h2 className="font-bold text-brand-ink">{t('personalInfo')}</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('firstName')}</Label>
            <Input value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('lastName')}</Label>
            <Input value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t('email')}</Label>
          <Input dir="ltr" className="text-start" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('saveChanges')}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm font-medium text-status-success">
              <Check className="h-4 w-4" /> {t('savedSuccess')}
            </span>
          )}
        </div>
      </Card>

      {/* Phone — link to change page */}
      <Card className="mb-4 p-0">
        <Link href="/account/phone" className="flex items-center justify-between p-6 transition hover:bg-brand-cream/30">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-brand-primary" />
            <div>
              <div className="font-bold text-brand-ink">{t('phoneNumber')}</div>
              <div className="text-sm text-brand-muted" dir="ltr">{formatPhoneDisplay(user.phone)}</div>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-brand-muted rtl:rotate-0 ltr:rotate-180" />
        </Link>
      </Card>

      {/* NOTE: NO password change section (OTP-only platform) */}

      {/* Danger zone */}
      <Card className="border-red-200 p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-1 h-5 w-5 text-status-danger" />
          <div className="flex-1">
            <h2 className="font-bold text-status-danger">{t('deleteAccount')}</h2>
            <p className="mb-3 text-sm text-brand-muted">{t('deleteAccountWarning')}</p>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
              {t('deleteAccountButton')}
            </Button>
          </div>
        </div>
      </Card>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-status-danger">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-ink">{t('deleteAccountButton')}</h2>
              <p className="mt-1 text-sm text-brand-muted">{t('deleteAccountConfirm')}</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-full bg-status-danger py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? t('deleting') : t('yesDelete')}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-full border border-brand-border py-2.5 text-sm font-medium text-brand-ink transition hover:bg-brand-cream/60 disabled:opacity-60"
              >
                {tc('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
