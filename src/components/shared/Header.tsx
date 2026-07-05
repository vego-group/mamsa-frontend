'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { Heart, Calendar, CreditCard, Settings, LogOut, ChevronDown, User as UserIcon, Menu, X } from 'lucide-react';
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
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/units', key: 'explore' },
  { href: '/contact', key: 'contact' },
  { href: '/about', key: 'about' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuthStore();
  const openAuth = useUiStore((s) => s.openAuth);
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  // Avoid hydration mismatch since auth state is from localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mobile nav drawer — closes automatically on navigation.
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
  };

  const userFullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '؟';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:h-20">
        {/* Logo (inline start) */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative text-sm font-medium transition hover:text-brand-primary',
                  active
                    ? 'font-bold text-brand-primary after:absolute after:-bottom-1.5 after:start-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand-primary'
                    : 'text-brand-ink',
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Actions (inline end) */}
        <div className="flex items-center gap-2">
          <Button asChild variant="default" size="default" className="hidden sm:inline-flex">
            <Link href="/host">{t('listProperty')}</Link>
          </Button>

          {mounted && isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 transition hover:bg-brand-cream/60">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-end leading-tight md:flex">
                    <span className="text-[10px] text-brand-muted">{t('greeting')}</span>
                    <span className="text-sm font-medium text-brand-ink">{userFullName}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-brand-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[220px]">
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> {t('favorites')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-reservations" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {t('reservations')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/payment-methods" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> {t('paymentMethods')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" /> {t('accountSettings')}
                  </Link>
                </DropdownMenuItem>
                {/* NOTE: no password section (OTP-only) */}
                <DropdownMenuSeparator />
                <DropdownMenuItem danger onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // On mobile the drawer carries the login action — keep the bar uncluttered.
            <Button variant="outline" className="hidden sm:inline-flex" onClick={() => openAuth('login')}>
              {t('login')}
            </Button>
          )}

          <LanguageToggle className="hidden md:flex" />

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-ink transition hover:bg-brand-cream/60 md:hidden"
            aria-label={t('menu')}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav drawer — portaled to <body>: the header's backdrop-blur
          creates a containing block that would otherwise trap `fixed` inside it. */}
      {mobileOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div
            className={cn(
              'absolute inset-y-0 flex w-[80%] max-w-xs flex-col bg-white shadow-xl',
              locale === 'ar' ? 'right-0' : 'left-0',
            )}
          >
            <div className="flex items-center justify-between border-b border-brand-border p-4">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition hover:bg-brand-cream"
                aria-label={t('close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-xl px-4 py-3 text-sm font-medium transition',
                      active
                        ? 'bg-brand-primary/10 font-bold text-brand-primary'
                        : 'text-brand-ink hover:bg-brand-cream/60',
                    )}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-brand-border p-4">
              <LanguageToggle className="w-full" />
              <Button asChild className="w-full">
                <Link href="/host">{t('listProperty')}</Link>
              </Button>
              {mounted && !isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setMobileOpen(false); openAuth('login'); }}
                >
                  {t('login')}
                </Button>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
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
