import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Lock } from 'lucide-react';
import { PolicyPage, PolicySection, PolicyNote } from '@/components/shared/PolicyPage';
import { BRAND } from '@/lib/constants/brand';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('policies.privacy');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('policies.privacy');
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const strongLtr = (chunks: React.ReactNode) => <strong dir="ltr">{chunks}</strong>;
  const contactLink = (chunks: React.ReactNode) => (
    <a href="/contact" className="font-medium text-brand-primary hover:underline">{chunks}</a>
  );
  const safetyLink = (chunks: React.ReactNode) => (
    <a href="/policies/safety" className="font-medium text-brand-primary hover:underline">{chunks}</a>
  );

  return (
    <PolicyPage
      icon={Lock}
      title={t('title')}
      subtitle={t('subtitle')}
      lastUpdatedLabel={t('lastUpdated', { date: t('lastUpdatedDate') })}
    >
      <PolicyNote>{t.rich('intro', { strong })}</PolicyNote>

      <PolicySection title={t('collectTitle')}>
        <p>{t('collectIntro')}</p>
        <ul>
          <li>{t.rich('collect.0', { strong })}</li>
          <li>{t.rich('collect.1', { strong })}</li>
          <li>{t.rich('collect.2', { strong })}</li>
          <li>{t.rich('collect.3', { strong, strongLtr })}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('paymentTitle')}>
        <p>{t.rich('paymentBody', { strong })}</p>
      </PolicySection>

      <PolicySection title={t('usageTitle')}>
        <ul>
          <li>{t('usage.0')}</li>
          <li>{t('usage.1')}</li>
          <li>{t('usage.2')}</li>
          <li>{t('usage.3')}</li>
          <li>{t('usage.4')}</li>
          <li>{t('usage.5')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('sharingTitle')}>
        <ul>
          <li>{t.rich('sharing.0', { strong })}</li>
          <li>{t.rich('sharing.1', { strong })}</li>
          <li>{t.rich('sharing.2', { strong })}</li>
          <li>{t.rich('sharing.3', { strong })}</li>
        </ul>
        <PolicyNote>{t.rich('noSaleNote', { strong })}</PolicyNote>
      </PolicySection>

      <PolicySection title={t('cookiesTitle')}>
        <ul>
          <li>{t.rich('cookies.0', { strong })}</li>
          <li>{t.rich('cookies.1', { strong })}</li>
          <li>{t.rich('cookies.2', { strong })}</li>
          <li>{t('cookies.3')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('retentionTitle')}>
        <p>{t('retentionBody')}</p>
      </PolicySection>

      <PolicySection title={t('securityTitle')}>
        <ul>
          <li>{t.rich('security.0', { strongLtr })}</li>
          <li>{t('security.1')}</li>
          <li>{t('security.2')}</li>
          <li>{t('security.3')}</li>
        </ul>
        <PolicyNote>{t.rich('securityNote', { strong, safetyLink })}</PolicyNote>
      </PolicySection>

      <PolicySection title={t('rightsTitle')}>
        <p>{t('rightsIntro')}</p>
        <ul>
          <li>{t.rich('rights.0', { strong })}</li>
          <li>{t.rich('rights.1', { strong })}</li>
          <li>{t.rich('rights.2', { strong })}</li>
          <li>{t.rich('rights.3', { strong })}</li>
          <li>{t.rich('rights.4', { strong })}</li>
        </ul>
        <p>{t.rich('rightsHow', { strongLtr, contactLink, email: BRAND.email })}</p>
      </PolicySection>

      <PolicySection title={t('childrenTitle')}>
        <p>{t('childrenBody')}</p>
      </PolicySection>

      <PolicySection title={t('transferTitle')}>
        <p>{t('transferBody')}</p>
      </PolicySection>

      <PolicySection title={t('changesTitle')}>
        <p>{t('changesBody')}</p>
      </PolicySection>

      <PolicySection title={t('contactTitle')}>
        <p>
          {t.rich('contactBody', {
            strongLtr,
            contactLink,
            email: BRAND.email,
            cr: BRAND.crNumber,
          })}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
