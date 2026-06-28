'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Globe, Heart, Calendar, CreditCard, Settings, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authApi } from '@/lib/api/client';
import { BRAND } from '@/lib/constants/brand';

const NAV_ITEMS = [
  { href: '/', labelAr: 'الرئيسية' },
  { href: '/units', labelAr: 'إكتشف وجهتك' },
  { href: '/contact', labelAr: 'تواصل معانا' },
  { href: '/about', labelAr: 'عن المنصة' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const openAuth = useUiStore((s) => s.openAuth);
  // Avoid hydration mismatch since auth state is from localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
  };

  const userFullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '؟';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:h-20">
        {/* Right side (RTL start): logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-ink transition hover:text-brand-primary"
            >
              {item.labelAr}
            </Link>
          ))}
        </nav>

        {/* Left side: actions */}
        <div className="flex items-center gap-2">
          <Button asChild variant="default" size="default" className="hidden sm:inline-flex">
            <Link href="/partner-onboarding">إدراج عقار</Link>
          </Button>

          {mounted && isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 transition hover:bg-brand-cream/60">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-end leading-tight md:flex">
                    <span className="text-[10px] text-brand-muted">هلا بالزين !</span>
                    <span className="text-sm font-medium text-brand-ink">{userFullName}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-brand-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[220px]">
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> مختاراتك المفضلة
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-reservations" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> الحجوزات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/payment-methods" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> وسائل الدفع
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> إعدادات الحساب
                  </Link>
                </DropdownMenuItem>
                {/* NOTE: "تسجيل الدخول والأمان" removed (OTP-only — no passwords) */}
                <DropdownMenuSeparator />
                <DropdownMenuItem danger onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => openAuth('login')}>
              سجل دخول
            </Button>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-muted transition hover:bg-brand-cream/60"
            aria-label="اللغة"
            title="العربية"
          >
            <Globe className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <Image
      src="/Mamsa_logo.png"
      alt={`${BRAND.nameAr} ${BRAND.nameEn}`}
      width={668}
      height={375}
      priority
      className="h-12 w-auto md:h-14"
    />
  );
}
