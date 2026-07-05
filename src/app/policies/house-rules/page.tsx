import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Home } from 'lucide-react';
import { PolicyPage, PolicySection, PolicyNote } from '@/components/shared/PolicyPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('policies.houseRules');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

export default async function HouseRulesPage() {
  const t = await getTranslations('policies.houseRules');
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const strongLtr = (chunks: React.ReactNode) => <strong dir="ltr">{chunks}</strong>;

  return (
    <PolicyPage
      icon={Home}
      title={t('title')}
      subtitle={t('subtitle')}
      lastUpdatedLabel={t('lastUpdated', { date: t('lastUpdatedDate') })}
    >
      <PolicyNote>{t.rich('intro', { strong })}</PolicyNote>

      <PolicySection title={t('checkInOutTitle')}>
        <ul>
          <li>{t.rich('checkInOut.0', { strongLtr })}</li>
          <li>{t('checkInOut.1')}</li>
          <li>{t('checkInOut.2')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('guestCountTitle')}>
        <ul>
          <li>{t('guestCount.0')}</li>
          <li>{t('guestCount.1')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('quietHoursTitle')}>
        <ul>
          <li>{t.rich('quietHours.0', { strongLtr })}</li>
          <li>{t.rich('quietHours.1', { strong })}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('smokingPetsTitle')}>
        <ul>
          <li>{t('smokingPets.0')}</li>
          <li>{t('smokingPets.1')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('cleanlinessTitle')}>
        <ul>
          <li>{t('cleanliness.0')}</li>
          <li>{t('cleanliness.1')}</li>
          <li>{t.rich('cleanliness.2', { strong })}</li>
          <li>{t('cleanliness.3')}</li>
        </ul>
      </PolicySection>

      <PolicySection title={t('complianceTitle')}>
        <p>{t('complianceBody')}</p>
      </PolicySection>
    </PolicyPage>
  );
}
