import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useReviewsData } from '../../lib/content';

import HorizontalCards from '../ui/HorizontalCards';

export default function Reviews() {
  const { t } = useTranslation();
  const reviews = useReviewsData();
  const featured = reviews.filter((r) => r.featured);

  if (featured.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-3">
              {t('reviews.title')}
            </h2>
            <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
              {t('reviews.subtitle')}
            </p>
          </div>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {t('reviews.allReviews')} <iconify-icon icon="solar:arrow-right-linear" width="16" />
          </Link>
        </div>
      </div>

      <HorizontalCards
        items={featured}
        keyExtractor={(review) => review.id}
        renderCard={(review) => (
          <>
            {/* Quote icon watermark */}
            <div className="absolute top-6 right-6 opacity-10">
              <iconify-icon icon="solar:chat-round-like-bold" width="80" style={{ color: 'white' }} />
            </div>
            {/* Bottom gradient */}
            <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <iconify-icon
                    key={i}
                    icon={i < review.rating ? 'solar:star-bold' : 'solar:star-linear'}
                    width="16"
                    className={i < review.rating ? 'text-amber-400' : 'text-white/30'}
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed line-clamp-3 mb-4">
                &ldquo;{review.description}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {review.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{review.name}</p>
                  <p className="text-xs text-white/60">{review.title}, {review.company}</p>
                </div>
              </div>
            </div>
          </>
        )}
      />
    </section>
  );
}
