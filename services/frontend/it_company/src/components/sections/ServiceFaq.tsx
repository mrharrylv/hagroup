import { useId } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface ServiceFaqProps {
  title?: string;
  items?: readonly FaqItem[];
}

/**
 * Frequently asked questions for a service page.
 *
 * Every answer stays visible: an accordion would hide the text behind a click,
 * which is weaker for crawlers and adds nothing for keyboard or screen-reader
 * users. The section is a landmark named by its heading, so it shows up in a
 * screen reader's region list. Renders nothing when the page has no FAQ.
 */
export default function ServiceFaq({ title, items }: ServiceFaqProps) {
  const headingId = useId();

  if (!title || !items || items.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2
        id={headingId}
        className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-12"
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.question}
            className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800"
          >
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
              {item.question}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
