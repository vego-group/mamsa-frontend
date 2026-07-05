import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Linkedin, Instagram, Twitter, Facebook, Phone, Mail } from 'lucide-react';
import { BRAND, SOCIAL_LINKS } from '@/lib/constants/brand';

export async function Footer() {
  const t = await getTranslations('footer');

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
          <p className="text-sm leading-relaxed text-brand-muted">{t('tagline')}</p>
        </div>

        {/* Quick links — mirror the header nav naming so the site reads as one map */}
        <div>
          <h3 className="mb-3 font-semibold text-brand-ink">{t('quickLinks')}</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li><Link href="/" className="hover:text-brand-primary">{t('links.home')}</Link></li>
            <li><Link href="/units" className="hover:text-brand-primary">{t('links.explore')}</Link></li>
            <li><Link href="/my-reservations" className="hover:text-brand-primary">{t('links.reservations')}</Link></li>
            <li><Link href="/about" className="hover:text-brand-primary">{t('links.about')}</Link></li>
            <li><Link href="/host" className="hover:text-brand-primary">{t('links.host')}</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="mb-3 font-semibold text-brand-ink">{t('support')}</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li><Link href="/contact" className="hover:text-brand-primary">{t('links.contact')}</Link></li>
            <li><Link href="/faq" className="hover:text-brand-primary">{t('links.faq')}</Link></li>
            <li><Link href="/policies/cancellation" className="hover:text-brand-primary">{t('links.cancellationPolicy')}</Link></li>
            <li><Link href="/policies/safety" className="hover:text-brand-primary">{t('links.safety')}</Link></li>
            <li><Link href="/policies/house-rules" className="hover:text-brand-primary">{t('links.houseRules')}</Link></li>
          </ul>
        </div>

        {/* Contact + social */}
        <div>
          <h3 className="mb-3 font-semibold text-brand-ink">{t('social')}</h3>
          <ul className="space-y-2 text-sm text-brand-muted">
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} dir="ltr" className="hover:text-brand-primary">
                {BRAND.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-brand-primary">
                {BRAND.email}
              </a>
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-3 text-brand-primary">
            {(
              [
                [SOCIAL_LINKS.linkedin, 'LinkedIn', Linkedin],
                [SOCIAL_LINKS.instagram, 'Instagram', Instagram],
                [SOCIAL_LINKS.twitter, 'Twitter', Twitter],
                [SOCIAL_LINKS.facebook, 'Facebook', Facebook],
              ] as const
            ).map(([href, label, Icon]) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-brand-primaryDark"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        <div className="rounded-full border border-brand-border bg-white/60 px-4 py-2 text-center text-xs text-brand-muted md:inline-block md:text-start">
          {t('license', { authority: t('licenseAuthority'), number: BRAND.licenseNumber })}
        </div>
      </div>

      <div className="border-t border-brand-border py-4 text-center text-xs text-brand-muted">
        © {new Date().getFullYear()} {t('brandName')} — {t('rights')}
      </div>
    </footer>
  );
}
