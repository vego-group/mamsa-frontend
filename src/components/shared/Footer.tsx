import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram, Twitter, Facebook, Phone, Mail } from 'lucide-react';
import { BRAND, SOCIAL_LINKS } from '@/lib/constants/brand';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-border bg-white">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
        {/* Brand block */}
        <div className="space-y-3">
          <Image
            src="/Mamsa_logo.jpg"
            alt={`${BRAND.nameAr} ${BRAND.nameEn}`}
            width={668}
            height={375}
            className="h-16 w-auto rounded-xl"
          />
          <p className="text-sm leading-relaxed text-brand-muted">{BRAND.tagline}</p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-3 font-semibold text-brand-ink">الروابط السريعة</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li><Link href="/" className="hover:text-brand-primary">الرئيسية</Link></li>
            <li><Link href="/units" className="hover:text-brand-primary">الأقسام</Link></li>
            <li><Link href="/my-reservations" className="hover:text-brand-primary">الحجوزات</Link></li>
            <li><Link href="/units" className="hover:text-brand-primary">البحث</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="mb-3 font-semibold text-brand-ink">الدعم والمساعدة</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li><Link href="/contact" className="hover:text-brand-primary">تواصل معنا</Link></li>
            <li><Link href="/faq" className="hover:text-brand-primary">الأسئلة الشائعة</Link></li>
          </ul>
        </div>

        {/* Contact + social */}
        <div>
          <h3 className="mb-3 font-semibold text-brand-ink">التواصل والسوشيال</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{BRAND.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-brand-primary">
                {BRAND.email}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-3 text-brand-primary">
            <a href={SOCIAL_LINKS.linkedin} aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
            <a href={SOCIAL_LINKS.instagram} aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            <a href={SOCIAL_LINKS.twitter} aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
            <a href={SOCIAL_LINKS.facebook} aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="rounded-full border border-brand-border bg-white/60 px-4 py-2 text-center text-xs text-brand-muted md:inline-block md:text-start">
          مرخص من {BRAND.licenseAuthority} ترخيص رقم ({BRAND.licenseNumber})
        </div>
      </div>

      <div className="border-t border-brand-border py-4 text-center text-xs text-brand-muted">
        جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
