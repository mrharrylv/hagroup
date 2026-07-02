import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/useTheme';
import { useServicesData } from '../../lib/content';
import Logo from '../ui/Logo';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'lv', label: 'LV' },
  { code: 'ru', label: 'RU' },
] as const;

export default function Header() {
  const { t, i18n } = useTranslation();
  const servicesData = useServicesData();
  const { theme, toggleTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('cloudie-lang', code);
    setLangOpen(false);
  };

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Outside-click dismiss for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    {/* Blur overlay when services dropdown is open */}
    {servicesOpen && (
      <div
        className="fixed inset-0 top-24 bg-black/10 dark:bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setServicesOpen(false)}
      />
    )}
    <header className="fixed top-0 w-full z-50 transition-colors duration-300">
      <div className="absolute inset-x-0 top-0 h-24 backdrop-blur-md bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800/80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 text-zinc-900 dark:text-white">
          <Logo className="h-9 sm:h-[42px]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {/* Services Dropdown */}
          <div className="relative" ref={servicesRef}>
            <button
              onClick={() => setServicesOpen((prev) => !prev)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                servicesOpen
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {t('nav.services')}
              <iconify-icon
                icon="solar:alt-arrow-down-linear"
                width="16"
                style={{ transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
              />
            </button>

            {servicesOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-[640px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden z-50 animate-dropdown-in origin-top">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {servicesData.items.map((item, idx) => (
                    <Link
                      key={item.key}
                      to={item.path}
                      className="group flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors animate-card-slide-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                        <iconify-icon icon={item.icon} width="18" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
                  <Link
                    to="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    {t('nav.viewAllServices')}
                    <iconify-icon icon="solar:arrow-right-linear" width="14" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/projects"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            {t('nav.ourWork')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Language Switcher — desktop */}
          <div className="relative hidden md:block" ref={langRef}>
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center justify-center gap-1 h-9 px-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
            >
              {currentLang.label}
              <iconify-icon icon="solar:alt-arrow-down-linear" width="16" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-24 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      lang.code === i18n.language
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark/Light Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <iconify-icon icon="solar:sun-linear" width="20" />
            ) : (
              <iconify-icon icon="solar:moon-linear" width="20" />
            )}
          </button>

          <Link
            to="/contact"
            className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors shadow-sm"
          >
            {t('nav.bookConsultation')}
          </Link>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
            aria-label="Toggle menu"
          >
            <iconify-icon icon={mobileOpen ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear'} width="24" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-lg max-h-[calc(100vh-6rem)] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-1">
            {/* Services accordion */}
            <button
              onClick={() => setMobileServicesOpen((prev) => !prev)}
              className="flex items-center justify-between px-4 py-3 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-3">
                <iconify-icon icon="solar:widget-linear" width="20" className="text-zinc-400" />
                {t('nav.services')}
              </span>
              <iconify-icon
                icon="solar:alt-arrow-down-linear"
                width="16"
                className="text-zinc-400"
                style={{ transform: mobileServicesOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}
              />
            </button>

            {mobileServicesOpen && (
              <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 flex flex-col gap-0.5 mb-2">
                {servicesData.items.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <iconify-icon icon={item.icon} width="16" className="text-zinc-400 shrink-0" />
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/projects"
              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <iconify-icon icon="solar:case-round-linear" width="20" className="text-zinc-400" />
              {t('nav.ourWork')}
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
            >
              <iconify-icon icon="solar:buildings-2-linear" width="20" className="text-zinc-400" />
              {t('nav.company')}
            </Link>

            {/* Language Switcher — mobile */}
            <div className="flex items-center gap-2 px-4 py-3 mt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mr-2">
                Lang
              </span>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    lang.code === i18n.language
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* CTA — mobile */}
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 mt-3 px-4 py-3 text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors shadow-sm"
            >
              {t('nav.bookConsultation')}
            </Link>
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
