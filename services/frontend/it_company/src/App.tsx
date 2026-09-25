import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import type { i18n as I18n } from 'i18next';
import AppRoutes from './AppRoutes';
import { LocaleContext } from './i18n/LocaleContext';
import { basenameFor, type Lang } from './i18n/locales';
import { useLocaleRouting } from './i18n/useLocaleRouting';
import { revealRoot } from './lib/boot';

interface AppProps {
  i18n: I18n;
  /** Language of the URL the page was opened at. */
  initialLang: Lang;
}

export default function App({ i18n, initialLang }: AppProps) {
  const locale = useLocaleRouting(i18n, initialLang);

  // The inline script in index.html hides #root while it moves a returning
  // visitor to their language; the app has rendered, so show it.
  useEffect(() => {
    revealRoot(document.documentElement);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={locale}>
        {/* Keyed on the language: a new basename needs a new router. */}
        <BrowserRouter key={locale.lang} basename={basenameFor(locale.lang)}>
          <AppRoutes />
        </BrowserRouter>
      </LocaleContext.Provider>
    </I18nextProvider>
  );
}
