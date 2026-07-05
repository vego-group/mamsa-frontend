import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CalendarX2 } from 'lucide-react';
import { PolicyPage, PolicySection, PolicyNote } from '@/components/shared/PolicyPage';
import { CancellationPolicyDisplay } from '@/components/features/booking/CancellationPolicyDisplay';
import { POLICY_REGISTRY } from '@/lib/constants/cancellation-policies';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('policies.cancellation');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

/** The three templates, rendered from the SAME constants the checkout uses. */
const TEMPLATES = [POLICY_REGISTRY.flexible, POLICY_REGISTRY.moderate, POLICY_REGISTRY.strict];

export default async function CancellationPolicyPage() {
  const t = await getTranslations('policies.cancellation');
  const tp = await getTranslations('cancellationPolicy');
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const contactLink = (chunks: React.ReactNode) => (
    <a href="/contact" className="font-medium text-brand-primary hover:underline">{chunks}</a>
  );

  return (
    <PolicyPage
      icon={CalendarX2}
      title={t('title')}
      subtitle={t('subtitle')}
      lastUpdatedLabel={t('lastUpdated', { date: t('lastUpdatedDate') })}
    >
      <PolicySection title={t('howItWorksTitle')}>
        <p>{t('howItWorksBody')}</p>
        <PolicyNote>{t.rich('freezeNote', { strong })}</PolicyNote>
      </PolicySection>

      <PolicySection title={t('templatesTitle')}>
        <div className="space-y-4">
          {TEMPLATES.map((policy) => (
            <div key={policy.template} className="rounded-2xl border border-brand-border bg-white p-4">
              <div className="mb-1 font-bold text-brand-ink">{tp(`templates.${policy.template}`)}</div>
              <p className="mb-3 text-xs">{t(`templateDescriptions.${policy.template}`)}</p>
              <CancellationPolicyDisplay policy={policy} showHeader={false} />
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title={t('generalTermsTitle')}>
        <ul>
          <li>{t('generalTerms.0')}</li>
          <li>{t('generalTerms.1')}</li>
          <li>{t.rich('generalTerms.2', { strong })}</li>
          <li>{t('generalTerms.3')}</li>
          <li>{t.rich('generalTerms.4', { strong })}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('refundMechanismTitle')}>
        <ul>
          <li>{t('refundMechanism.0')}</li>
          <li>{t('refundMechanism.1')}</li>
          <li>{t.rich('refundMechanism.2', { strong })}</li>
          <li>{t('refundMechanism.3')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('needHelpTitle')}>
        <p>{t.rich('needHelpBody', { contactLink })}</p>
      </PolicySection>
    </PolicyPage>
  );
}
