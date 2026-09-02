import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContactForm from './components/ContactForm';
import CookieBanner from './components/CookieBanner';
import ProductVisual from './components/ProductVisual';
import Seo from './components/Seo';
import { localized, localizedList, localizedString, partners, products, reviews } from './lib/content';
import { supportedLanguages, type Language } from './i18n';

interface LegalSection {
  title: string;
  content: string;
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

function Header() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLanguage = (i18n.resolvedLanguage || i18n.language || 'lv').slice(0, 2);

  const changeLanguage = (language: Language) => {
    void i18n.changeLanguage(language);
    try {
      localStorage.setItem('iepako-language', language);
    } catch {
      // The selected language still applies to the current page.
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label={`${t('brand.name')} ${t('brand.division')}`}>
          <img src="/iepako-logo.svg" alt="IEPAKO" />
        </a>

        <button
          type="button"
          className="menu-toggle"
          aria-label={t('nav.menu')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Primary navigation">
          <a href="/#products" onClick={closeMenu}>{t('nav.products')}</a>
          <a href="/#approach" onClick={closeMenu}>{t('nav.approach')}</a>
          {partners.length > 0 && <a href="/#partners" onClick={closeMenu}>{t('nav.partners')}</a>}
          {reviews.length > 0 && <a href="/#reviews" onClick={closeMenu}>{t('nav.reviews')}</a>}
          <a className="nav-contact" href="/#contact" onClick={closeMenu}>{t('nav.contact')} <ArrowIcon /></a>
          <div className="language-switcher" aria-label="Language">
            {supportedLanguages.map((language) => (
              <button
                type="button"
                key={language}
                className={activeLanguage === language ? 'active' : ''}
                aria-pressed={activeLanguage === language}
                onClick={() => changeLanguage(language)}
              >
                {language.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();

  const reopenCookies = () => {
    window.dispatchEvent(new Event('iepako-reopen-cookies'));
  };

  return (
    <footer className="site-footer">
      <div className="shell footer-main">
        <div className="footer-brand">
          <div className="brand footer-logo">
            <img src="/iepako-logo-light.svg" alt="IEPAKO" />
          </div>
          <p>{t('footer.tagline')}</p>
        </div>

        <div className="footer-information">
          <h2>{t('footer.information')}</h2>
          <div className="footer-information-links">
            <Link to="/company">{t('footer.companyDetails')} <ArrowIcon /></Link>
            <Link to="/privacy">{t('footer.privacy')} <ArrowIcon /></Link>
            <Link to="/cookies">{t('footer.cookies')} <ArrowIcon /></Link>
            {/*
              A real link to the parent company. The JSON-LD already declares
              parentOrganization; a visible link is what actually passes trust,
              and it is the honest version of "link the group sites together".
            */}
            <a href="https://www.hagroup.lv" target="_blank" rel="noopener">
              {t('footer.parent')} <ArrowIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>{t('footer.rights')}</p>
        <div>
          <button type="button" onClick={reopenCookies}>{t('footer.cookieSettings')}</button>
        </div>
      </div>
    </footer>
  );
}

function HeroArtwork() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="art-grid" />
      <svg viewBox="0 0 640 570">
        <path d="M133 360 301 164h185L316 360Z" fill="#f2f6f3" stroke="#173f36" strokeWidth="4" />
        <path d="M316 360 486 164v118L396 385H217L133 360Z" fill="#c7ddd5" stroke="#173f36" strokeWidth="4" />
        <path d="M301 164h185" stroke="#fff" strokeWidth="12" opacity=".7" />
        <g transform="translate(71 291) rotate(-11)">
          <rect x="0" y="0" width="303" height="116" fill="#eef7f3" stroke="#173f36" strokeWidth="4" />
          <ellipse cx="0" cy="58" rx="38" ry="58" fill="#fff" stroke="#173f36" strokeWidth="4" />
          <ellipse cx="0" cy="58" rx="13" ry="27" fill="#173f36" />
          <ellipse cx="303" cy="58" rx="38" ry="58" fill="#c9ddd6" stroke="#173f36" strokeWidth="4" />
          <path d="M68 29h141" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
        </g>
        <circle cx="497" cy="110" r="46" fill="#f3ad45" />
        <path d="M530 397c-22 17-36 39-42 66" fill="none" stroke="#173f36" strokeWidth="4" strokeLinecap="round" />
        <path d="M528 401c15 8 27 22 31 39-17 1-31-5-41-17" fill="#d8e7e1" stroke="#173f36" strokeWidth="3" />
      </svg>
      <div className="art-label label-one">LDPE</div>
      <div className="art-label label-two">POF</div>
      <div className="art-label label-three">CPP</div>
    </div>
  );
}

function HomePage() {
  const { t, i18n } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState('');
  const language = i18n.resolvedLanguage || i18n.language || 'lv';
  const steps = t('approach.steps', { returnObjects: true }) as Array<{ number: string; title: string; text: string }>;

  const requestProduct = (productId: string) => {
    setSelectedProduct(productId);
    window.setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  return (
    <main>
      <section className="hero-section">
        <div className="shell hero-layout">
          <div className="hero-copy">
            <p className="eyebrow"><span />{t('hero.eyebrow')}</p>
            <h1>{t('hero.title')}</h1>
            <p className="hero-lead">{t('hero.lead')}</p>
            <div className="hero-actions">
              <a className="button button-accent" href="#contact">{t('hero.primaryCta')} <ArrowIcon /></a>
              <a className="text-link" href="#products">{t('hero.secondaryCta')} <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero-note">{t('hero.note')}</p>
          </div>
          <HeroArtwork />
        </div>

        <div className="shell capability-strip">
          {(['range', 'fit', 'business'] as const).map((item, index) => (
            <article key={item}>
              <span className="capability-number">0{index + 1}</span>
              <div>
                <h2>{t(`hero.cards.${item}`)}</h2>
                <p>{t(`hero.cards.${item}Text`)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section products-section" id="products">
        <div className="shell">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow"><span />{t('products.eyebrow')}</p>
              <h2>{t('products.title')}</h2>
            </div>
            <p>{t('products.intro')}</p>
          </div>

          <div className="product-grid">
            {products.map((product, index) => (
              <article className={`product-card product-card-${(index % 3) + 1}`} key={product.id}>
                <div className="product-visual-wrap">
                  <span className="price-pill">{t('products.noPrice')}</span>
                  <ProductVisual variant={product.visual} />
                </div>
                <div className="product-content">
                  <p className="product-index">{String(index + 1).padStart(2, '0')}</p>
                  <h3>{localized(product.name, language)}</h3>
                  <p>{localized(product.description, language)}</p>
                  <div className="product-range">
                    <span>{t('products.orderRange')}</span>
                    <strong>{localized(product.orderRange, language)}</strong>
                  </div>
                  <ul>
                    {localizedList(product.features, language).map((feature) => (
                      <li key={feature}><span>✓</span>{feature}</li>
                    ))}
                  </ul>
                  <button className="product-link" type="button" onClick={() => requestProduct(product.id)}>
                    {t('products.request')} <ArrowIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section approach-section" id="approach">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow light"><span />{t('approach.eyebrow')}</p>
            <h2>{t('approach.title')}</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {partners.length > 0 && (
        <section className="section partners-section" id="partners">
          <div className="shell">
            <div className="section-heading centered">
              <p className="eyebrow"><span />{t('partners.eyebrow')}</p>
              <h2>{t('partners.title')}</h2>
              <p className="section-intro">{t('partners.intro')}</p>
            </div>
            <div className="partner-grid">
              {partners.map((partner) => {
                const card = (
                  <>
                    <span className="partner-category">{localized(partner.category, language)}</span>
                    <strong>{partner.name}</strong>
                    <p>{localized(partner.description, language)}</p>
                    {partner.website && <span className="partner-arrow" aria-hidden="true">↗</span>}
                  </>
                );
                return partner.website ? (
                  <a key={partner.id} href={partner.website} target="_blank" rel="noreferrer" aria-label={partner.name}>{card}</a>
                ) : <div key={partner.id}>{card}</div>;
              })}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="section reviews-section" id="reviews">
          <div className="shell">
            <div className="section-heading centered">
              <p className="eyebrow"><span />{t('reviews.eyebrow')}</p>
              <h2>{t('reviews.title')}</h2>
            </div>
            <div className="review-grid">
              {reviews.map((review) => (
                <blockquote key={review.id}>
                  {review.rating && (
                    <div className="review-rating" aria-label={`${review.rating} out of 5 stars`}>
                      <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <strong>{review.rating}/5</strong>
                    </div>
                  )}
                  <p>“{localized(review.quote, language)}”</p>
                  <footer>
                    <strong>{review.company || localizedString(review.author, language)}</strong>
                    <span>{[
                      review.company ? localizedString(review.author, language) : '',
                      review.role ? localized(review.role, language) : '',
                    ].filter(Boolean).join(', ')}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section contact-section" id="contact">
        <div className="shell contact-layout">
          <div className="contact-copy">
            <p className="eyebrow light"><span />{t('contact.eyebrow')}</p>
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.intro')}</p>
            <div className="direct-email">
              <span>{t('contact.direct')}</span>
              <a href="mailto:info@hagroup.lv">info@hagroup.lv <ArrowIcon /></a>
            </div>
          </div>
          <ContactForm selectedProduct={selectedProduct} onProductChange={setSelectedProduct} />
        </div>
      </section>
    </main>
  );
}

function CompanyPage() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="legal-page company-page">
      <div className="shell legal-shell">
        <Link className="legal-back" to="/">← {t('legal.back')}</Link>
        <p className="eyebrow"><span />{t('brand.name')}</p>
        <h1>{t('company.title')}</h1>
        <p className="legal-intro">{t('company.intro')}</p>

        <dl className="company-page-details">
          <div><dt>{t('company.nameLabel')}</dt><dd>{t('company.name')}</dd></div>
          <div><dt>{t('company.registrationLabel')}</dt><dd>{t('company.registration')}</dd></div>
          <div><dt>{t('company.vatLabel')}</dt><dd>{t('company.vat')}</dd></div>
          <div><dt>{t('company.emailLabel')}</dt><dd><a href="mailto:info@hagroup.lv">{t('company.email')}</a></dd></div>
        </dl>
      </div>
    </main>
  );
}

function LegalPage({ type }: { type: 'privacy' | 'cookies' }) {
  const { t } = useTranslation();
  const sections = t(`legal.${type}.sections`, { returnObjects: true }) as LegalSection[];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  return (
    <main className="legal-page">
      <div className="shell legal-shell">
        <Link className="legal-back" to="/">← {t('legal.back')}</Link>
        <p className="eyebrow"><span />{t('brand.name')}</p>
        <h1>{t(`legal.${type}.title`)}</h1>
        <p className="legal-intro">{t(`legal.${type}.intro`)}</p>
        <p className="legal-date">{t('legal.lastUpdated')}</p>
        <div className="legal-sections">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function PageFrame() {
  return (
    <div className="app-shell">
      <Seo />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/cookies" element={<LegalPage type="cookies" />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <CookieBanner />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PageFrame />
    </BrowserRouter>
  );
}
