import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

const LINKS = [
  { to: '/map', key: 'nav.map', label: 'Map' },
  { to: '/campaigns', key: 'nav.campaigns', label: 'Group buys' },
  { to: '/suppliers', key: 'nav.suppliers', label: 'For suppliers' },
  { to: '/demo', key: 'nav.dashboard', label: 'Dashboard' },
] as const;

export function Header() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-[1000] h-14 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="bg-brand-700 inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm text-white">
            K
          </span>
          Kopā
          <span className="hidden rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 uppercase sm:inline">
            demo
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {t(link.key, link.label)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'lv' : 'en')}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            aria-label="Switch language"
          >
            {lang === 'en' ? 'LV' : 'EN'}
          </button>
          <Link
            to="/start"
            className="bg-brand-600 hover:bg-brand-700 hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-white sm:inline-block"
          >
            {t('cta.start', 'Start a group buy')}
          </Link>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-600 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-b border-slate-200 bg-white px-4 py-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {t(link.key, link.label)}
              </NavLink>
            ))}
            <NavLink to="/start" className={linkClass} onClick={() => setOpen(false)}>
              {t('cta.start', 'Start a group buy')}
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
