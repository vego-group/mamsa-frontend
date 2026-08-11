import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Scale } from 'lucide-react';
import { PolicyPage, PolicySection, PolicyNote } from '@/components/shared/PolicyPage';
import { BRAND } from '@/lib/constants/brand';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('policies.terms');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

export default async function TermsPage() {
  const t = await getTranslations('policies.terms');
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const strongLtr = (chunks: React.ReactNode) => <strong dir="ltr">{chunks}</strong>;
  const link = (href: string, chunks: React.ReactNode) => (
    <a href={href} className="font-medium text-brand-primary hover:underline">{chunks}</a>
  );
  const contactLink = (chunks: React.ReactNode) => link('/contact', chunks);
  const cancellationLink = (chunks: React.ReactNode) => link('/policies/cancellation', chunks);
  const houseRulesLink = (chunks: React.ReactNode) => link('/policies/house-rules', chunks);
  const privacyLink = (chunks: React.ReactNode) => link('/policies/privacy', chunks);

  return (
    <PolicyPage
      icon={Scale}
      title={t('title')}
      subtitle={t('subtitle')}
      lastUpdatedLabel={t('lastUpdated', { date: t('lastUpdatedDate') })}
    >
      <PolicyNote>{t.rich('intro', { strong })}</PolicyNote>

      <PolicySection title={t('definitionsTitle')}>
        <ul>
          <li>{t.rich('definitions.0', { strong })}</li>
          <li>{t.rich('definitions.1', { strong })}</li>
          <li>{t.rich('definitions.2', { strong })}</li>
          <li>{t.rich('definitions.3', { strong })}</li>
          <li>{t.rich('definitions.4', { strong })}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('roleTitle')}>
        <p>{t.rich('roleBody', { strong })}</p>
      </PolicySection>

      <PolicySection title={t('eligibilityTitle')}>
        <ul>
          <li>{t.rich('eligibility.0', { strong })}</li>
          <li>{t('eligibility.1')}</li>
          <li>{t('eligibility.2')}</li>
          <li>{t('eligibility.3')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('pricingTitle')}>
        <ul>
          <li>{t.rich('pricing.0', { strongLtr })}</li>
          <li>{t.rich('pricing.1', { strong })}</li>
          <li>{t('pricing.2')}</li>
          <li>{t.rich('pricing.3', { strong })}</li>
          <li>{t('pricing.4')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('cancellationTitle')}>
        <p>{t.rich('cancellationBody', { strong, cancellationLink })}</p>
      </PolicySection>

      <PolicySection title={t('guestObligationsTitle')}>
        <ul>
          <li>{t.rich('guestObligations.0', { houseRulesLink })}</li>
          <li>{t('guestObligations.1')}</li>
          <li>{t('guestObligations.2')}</li>
          <li>{t('guestObligations.3')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('partnerObligationsTitle')}>
        <ul>
          <li>{t('partnerObligations.0')}</li>
          <li>{t('partnerObligations.1')}</li>
          <li>{t('partnerObligations.2')}</li>
          <li>{t('partnerObligations.3')}</li>
          <li>{t('partnerObligations.4')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('reviewsTitle')}>
        <p>{t('reviewsBody')}</p>
      </PolicySection>

      <PolicySection title={t('prohibitedTitle')}>
        <ul>
          <li>{t('prohibited.0')}</li>
          <li>{t('prohibited.1')}</li>
          <li>{t('prohibited.2')}</li>
          <li>{t('prohibited.3')}</li>
          <li>{t('prohibited.4')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('ipTitle')}>
        <p>{t('ipBody')}</p>
      </PolicySection>

      <PolicySection title={t('liabilityTitle')}>
        <p>{t.rich('liabilityBody', { strong })}</p>
      </PolicySection>

      <PolicySection title={t('suspensionTitle')}>
        <p>{t('suspensionBody')}</p>
      </PolicySection>

      <PolicySection title={t('privacyTitle')}>
        <p>{t.rich('privacyBody', { privacyLink })}</p>
      </PolicySection>

      <PolicySection title={t('changesTitle')}>
        <p>{t('changesBody')}</p>
      </PolicySection>

      <PolicySection title={t('lawTitle')}>
        <p>{t.rich('lawBody', { strong })}</p>
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
