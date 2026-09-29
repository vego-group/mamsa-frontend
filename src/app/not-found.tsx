import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Every 404 on the site — a mistyped URL, and a unit the API says is not
 * there (`notFound()` on the unit page). In the site's own words instead of
 * Next's English default, and with a way on: a 404 with none leaves the
 * visitor only the back button. Next marks it noindex itself.
 */
export default function NotFound() {
  const t = useTranslations('common');
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface text-brand-muted">
          <SearchX className="h-7 w-7" />
        </div>
        <h1 className="text-lg font-bold text-brand-ink">{t('notFoundTitle')}</h1>
        <p className="text-sm leading-relaxed text-brand-muted">{t('notFoundBody')}</p>
        <Button asChild>
          <Link href="/units">{t('explore')}</Link>
        </Button>
      </Card>
    </div>
  );
}
