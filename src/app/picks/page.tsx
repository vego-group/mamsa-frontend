import type { Metadata } from 'next';
import { PicksSection } from '@/components/features/home/PicksSection';

export const metadata: Metadata = {
  title: 'مختارات لك | مَمسَى',
  description: 'تصفّح الوحدات المختارة بعناية حسب التصنيف.',
};

export default function PicksPage({ searchParams }: { searchParams: { cat?: string } }) {
  return (
    <div className="py-8">
      <PicksSection initialCategory={searchParams.cat} limit={12} />
    </div>
  );
}
