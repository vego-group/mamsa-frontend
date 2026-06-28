'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MapPin, Trash2, ChevronLeft, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi, authApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { formatPhoneDisplay } from '@/lib/utils/phone';
import type { User } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const { user: storedUser, updateUser, logout } = useAuthStore();
  const [user, setUser] = useState<User | null>(storedUser);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    accountApi.me().then(setUser).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await accountApi.updateProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      updateUser(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await accountApi.deleteAccount();
    await authApi.logout();
    logout();
    router.push('/');
  };

  if (!user) return <div className="container mx-auto p-10">جاري التحميل...</div>;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-ink">إعدادات الحساب</h1>

      {/* Profile */}
      <Card className="mb-4 space-y-4 p-6">
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-brand-primary" />
          <h2 className="font-semibold text-brand-ink">المعلومات الشخصية</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>الاسم الأول</Label>
            <Input value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>الاسم الأخير</Label>
            <Input value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input dir="ltr" className="text-start" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </Button>
      </Card>

      {/* Phone — link to change page */}
      <Card className="mb-4 p-6">
        <Link href="/account/phone" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-brand-primary" />
            <div>
              <div className="font-semibold">رقم الجوال</div>
              <div className="text-sm text-brand-muted" dir="ltr">{formatPhoneDisplay(user.phone)}</div>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 text-brand-muted" />
        </Link>
      </Card>

      {/* NOTE: NO password change section (OTP-only platform) */}

      {/* Addresses */}
      <Card className="mb-4 space-y-3 p-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-brand-primary" />
          <h2 className="font-semibold text-brand-ink">العناوين المحفوظة</h2>
        </div>
        <div className="rounded-xl border border-dashed border-brand-border p-4 text-sm text-brand-muted">
          لم تقم بإضافة أي عنوان بعد.
        </div>
        <Button variant="outline" size="sm">+ إضافة عنوان جديد</Button>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-1 h-5 w-5 text-status-danger" />
          <div className="flex-1">
            <h2 className="font-semibold text-status-danger">حذف الحساب</h2>
            <p className="mb-3 text-sm text-brand-muted">
              عند حذف حسابك، سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن استرجاعها.
            </p>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              {confirmDelete ? 'اضغط مرة أخرى للتأكيد النهائي' : 'حذف الحساب نهائيًا'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
