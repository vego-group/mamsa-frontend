import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck } from 'lucide-react';
import { PolicyPage, PolicySection, PolicyNote } from '@/components/shared/PolicyPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('policies.safety');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

export default async function SafetyPolicyPage() {
  const t = await getTranslations('policies.safety');
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const strongLtr = (chunks: React.ReactNode) => <strong dir="ltr">{chunks}</strong>;
  const contactLink = (chunks: React.ReactNode) => (
    <a href="/contact" className="font-medium text-brand-primary hover:underline">{chunks}</a>
  );

  return (
    <PolicyPage
      icon={ShieldCheck}
      title={t('title')}
      subtitle={t('subtitle')}
      lastUpdatedLabel={t('lastUpdated', { date: t('lastUpdatedDate') })}
    >
      <PolicySection title={t('bookingPaymentTitle')}>
        <ul>
          <li>{t.rich('bookingPayment.0', { strong })}</li>
          <li>{t.rich('bookingPayment.1', { strong })}</li>
          <li>{t('bookingPayment.2')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('accountProtectionTitle')}>
        <ul>
          <li>{t.rich('accountProtection.0', { strong })}</li>
          <li>{t('accountProtection.1')}</li>
          <li>{t('accountProtection.2')}</li>
        </ul>
        <PolicyNote>{t.rich('goldenRule', { strong })}</PolicyNote>
      </PolicySection>

      <PolicySection title={t('beforeBookingTitle')}>
        <ul>
          <li>{t('beforeBooking.0')}</li>
          <li>{t('beforeBooking.1')}</li>
          <li>{t('beforeBooking.2')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('duringStayTitle')}>
        <ul>
          <li>{t('duringStay.0')}</li>
          <li>{t('duringStay.1')}</li>
          <li>{t.rich('duringStay.2', { strongLtr })}</li>
          <li>{t('duringStay.3')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('damageResponsibilityTitle')}>
        <p>{t('damageResponsibilityBody')}</p>
      </PolicySection>

      <PolicySection title={t('reportIssueTitle')}>
        <p>{t.rich('reportIssueBody', { contactLink })}</p>
      </PolicySection>
    </PolicyPage>
  );
}
