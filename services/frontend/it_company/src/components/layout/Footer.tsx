import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 pt-12 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 text-zinc-900 dark:text-white">
              <Logo className="h-12" />
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
              {t('footer.description')}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">{t('footer.services.title')}</h4>
            <ul className="space-y-3">
              <li><Link to="/services/website-development" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.websiteDevelopment')}</Link></li>
              <li><Link to="/services/system-development" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.systemDevelopment')}</Link></li>
              <li><Link to="/services/cloud-migration" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.cloudArchitecture')}</Link></li>
              <li><Link to="/services/devops" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.devopsAutomation')}</Link></li>
              <li><Link to="/services/it-infrastructure" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.itInfrastructure')}</Link></li>
              <li><Link to="/services/full-cycle" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.fullCycle')}</Link></li>
              <li><Link to="/services/ai-integration" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.aiIntegration')}</Link></li>
              <li><Link to="/services/consulting" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.services.itConsulting')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.company.aboutUs')}</Link></li>
              <li><Link to="/careers" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.company.careers')}</Link></li>
              <li><Link to="/contact" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.company.contact')}</Link></li>
              <li><Link to="/company-details" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('footer.company.companyDetails')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">{t('footer.legal.title')}</h4>
            <ul className="space-y-3">
              <li><Link to="/legal/terms" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.legal.terms')}</Link></li>
              <li><Link to="/legal/privacy" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.legal.privacy')}</Link></li>
              <li><Link to="/legal/cookies" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">{t('footer.legal.cookies')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center">
          <p className="text-xs text-zinc-500">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
