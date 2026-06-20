import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useReviewsData } from '../lib/content';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <iconify-icon
          key={i}
          icon={i < rating ? 'solar:star-bold' : 'solar:star-linear'}
          width="16"
          className={i < rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { t } = useTranslation();
  const reviews = useReviewsData();

  const featured = reviews.filter((r) => r.featured);
  const other = reviews.filter((r) => !r.featured);

  return (
    <>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16" />
          {t('reviews.backHome')}
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-4">
          {t('reviews.title')}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          {t('reviews.subtitle')}
        </p>
      </section>

      {/* Featured Reviews */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6">
            {t('reviews.featured')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featured.map((review) => (
              <div
                key={review.id}
                className="group p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors duration-300 flex flex-col"
              >
                {/* Avatar + Meta */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
                    {review.image ? (
                      <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      review.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{review.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {review.title}, {review.company}
                    </p>
                  </div>
                </div>

                <StarRating rating={review.rating} />

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-4 flex-1">
                  "{review.description}"
                </p>

                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6">
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other Reviews */}
      {other.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6">
            {t('reviews.allReviews')}
          </h2>
          <div className="space-y-4">
            {other.map((review) => (
              <div
                key={review.id}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-6"
              >
                <div className="flex items-center gap-4 md:w-64 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shrink-0 overflow-hidden">
                    {review.image ? (
                      <img src={review.image} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                      review.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{review.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {review.title}, {review.company}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <StarRating rating={review.rating} />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2">
                    "{review.description}"
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl sm:rounded-3xl bg-indigo-600 dark:bg-indigo-500 p-6 sm:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            {t('reviews.ctaTitle')}
          </h2>
          <p className="text-base text-indigo-100 mb-8 max-w-2xl mx-auto">
            {t('reviews.ctaText')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            {t('reviews.ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}
