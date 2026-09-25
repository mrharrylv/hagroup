import { describe, expect, it } from 'vitest';
import { LOCALES, type Lang } from './locales';
import enSeo from './locales/en/6_seo.json';
import lvSeo from './locales/lv/6_seo.json';
import ruSeo from './locales/ru/6_seo.json';
import enServices from './locales/en/8_services.json';
import lvServices from './locales/lv/8_services.json';
import ruServices from './locales/ru/8_services.json';

/**
 * Search copy and service FAQs may only say what the site itself states.
 * These tests pin the claims a review found overstated, in all three
 * languages, and the shape every search snippet keeps.
 */

type Copy = { seo: typeof enSeo; services: typeof enServices };

const COPY: Record<Lang, Copy> = {
  en: { seo: enSeo, services: enServices },
  lv: { seo: lvSeo, services: lvServices },
  ru: { seo: ruSeo, services: ruServices },
};

const EM_DASH = '—';

function description(lang: Lang, path: string): string {
  const pages: Record<string, { description: string }> = COPY[lang].seo.pages;
  return pages[path].description;
}

function faqOf(lang: Lang) {
  return Object.entries(COPY[lang].services.pages).map(([key, page]) => ({ key, faq: page.faq }));
}

describe.each(LOCALES)('search copy in %s', (lang) => {
  const pages = Object.entries(COPY[lang].seo.pages);

  it('ends every title with the brand and keeps it within 70 characters', () => {
    for (const [path, page] of pages) {
      expect(page.title, path).toMatch(/ \| HA Group$/);
      expect(page.title.length, `${path}: ${page.title}`).toBeLessThanOrEqual(70);
    }
  });

  it('keeps every description between 120 and 160 characters', () => {
    for (const [path, page] of pages) {
      expect(page.description.length, `${path}: ${page.description}`).toBeGreaterThanOrEqual(120);
      expect(page.description.length, `${path}: ${page.description}`).toBeLessThanOrEqual(160);
    }
  });

  it('has no em dash', () => {
    expect(JSON.stringify(COPY[lang].seo)).not.toContain(EM_DASH);
  });
});

describe.each(LOCALES)('service FAQs in %s', (lang) => {
  it('has as many questions per page as English', () => {
    const english = faqOf('en');
    expect(faqOf(lang).map(({ key, faq }) => [key, faq.length])).toEqual(
      english.map(({ key, faq }) => [key, faq.length]),
    );
  });

  it('ends every question with a question mark and has no em dash', () => {
    for (const { key, faq } of faqOf(lang)) {
      for (const entry of faq) {
        expect(entry.question, key).toMatch(/\?$/);
        expect(`${entry.question} ${entry.answer}`, key).not.toContain(EM_DASH);
      }
    }
  });
});

describe('the /contact description', () => {
  // The site states a registered office in Riga and a remote-first team, not a team in Riga.
  const CITY: Record<Lang, RegExp> = { en: /R[iī]g/, lv: /R[iī]g/, ru: /Риг/ };

  it.each(LOCALES)('does not place the team in a city (%s)', (lang) => {
    expect(description(lang, '/contact')).not.toMatch(CITY[lang]);
  });
});

describe('the /careers description', () => {
  // 2_careers.json lists one role and invites a CV when no role fits.
  const DEPARTMENTS: Record<Lang, RegExp> = {
    en: /software|design|roles/i,
    lv: /izstrād|dizain/i,
    ru: /разработ|дизайн/i,
  };
  const SEND_A_CV: Record<Lang, RegExp> = { en: /\bCV\b/, lv: /\bCV\b/, ru: /резюме/ };

  it.each(LOCALES)('names no department and no count of roles (%s)', (lang) => {
    expect(description(lang, '/careers')).not.toMatch(DEPARTMENTS[lang]);
  });

  it.each(LOCALES)('offers the general application the page offers (%s)', (lang) => {
    expect(description(lang, '/careers')).toMatch(SEND_A_CV[lang]);
  });
});

describe('the /services description', () => {
  // It names seven of the eight services in 8_services.json, so the list must read as partial.
  const INCLUDING: Record<Lang, RegExp> = { en: /\bincluding\b/, lv: /\btostarp\b/, ru: /включая/ };
  const COUNTS: Record<Lang, Record<string, number>> = {
    en: { seven: 7, eight: 8, nine: 9 },
    lv: { septiņi: 7, astoņi: 8, deviņi: 9 },
    ru: { семь: 7, восемь: 8, девять: 9 },
  };

  it.each(LOCALES)('introduces its list of services as partial (%s)', (lang) => {
    expect(description(lang, '/services')).toMatch(INCLUDING[lang]);
  });

  it.each(LOCALES)('states no count other than the number of services (%s)', (lang) => {
    const words = new Set(description(lang, '/services').toLowerCase().split(/[^\p{L}]+/u));
    for (const [word, count] of Object.entries(COUNTS[lang])) {
      if (words.has(word)) expect(count, word).toBe(COPY[lang].services.items.length);
    }
  });
});

describe('the /legal/cookies description', () => {
  // 3_legal.json cookies section 2: language, theme, the notice acknowledgement, form protection.
  const STORED: Record<Lang, RegExp[]> = {
    en: [/language/, /theme/, /notice/, /form/],
    lv: [/valod/, /krāsu režīm/, /paziņojum/, /form/],
    ru: [/язык/, /тем[аыу]/, /уведомлени/, /форм/],
  };
  const NOT_USED: Record<Lang, RegExp[]> = {
    en: [/analytics/, /advertising/, /tracking/],
    lv: [/analītikas/, /reklāmas/, /izsekošanas/],
    ru: [/аналитическ/, /рекламн/, /отслеживающ/],
  };

  it.each(LOCALES)('names every purpose the policy stores a value for (%s)', (lang) => {
    for (const purpose of STORED[lang]) expect(description(lang, '/legal/cookies')).toMatch(purpose);
  });

  it.each(LOCALES)('still rules out analytics, advertising and tracking cookies (%s)', (lang) => {
    for (const kind of NOT_USED[lang]) expect(description(lang, '/legal/cookies')).toMatch(kind);
  });
});

describe('service descriptions', () => {
  // The pages promise "documentation" and "biweekly demos"; neither says full or working.
  const QUALIFIERS: Record<Lang, RegExp> = {
    en: /full documentation|working demo/i,
    lv: /pilna dokumentācija|strādājoš/i,
    ru: /полн\S* документац|рабоч\S* верси/i,
  };

  it.each(LOCALES)('add no qualifier the service pages never used (%s)', (lang) => {
    for (const path of ['/services/system-development', '/services/full-cycle']) {
      expect(description(lang, path), path).not.toMatch(QUALIFIERS[lang]);
    }
  });
});

describe('the DevOps FAQ', () => {
  // The page promises only to "select the right tools for your stack and team".
  const TOOLS_QUESTION = 'Do we have to replace the tools we use today?';
  const index = enServices.pages.devops.faq.findIndex((entry) => entry.question === TOOLS_QUESTION);

  it.each(LOCALES)('does not promise that the current tools stay (%s)', (lang) => {
    expect(index).toBeGreaterThanOrEqual(0);
    expect(COPY[lang].services.pages.devops.faq[index].answer).not.toMatch(/^(No|Nē|Нет)\./);
  });
});

describe('the cloud-migration FAQ', () => {
  // The NDA case study is an infrastructure modernization with data migration and
  // switchovers; it never says it was a cloud migration.
  const NDA = /NDA/;
  const YES = /^(Yes|Jā|Да)[.,!]/;
  const MODERNIZATION: Record<Lang, RegExp> = {
    en: /infrastructure modernization/,
    lv: /infrastruktūras modernizācij/,
    ru: /модернизаци\S* инфраструктуры/,
  };

  it.each(LOCALES)('cites the NDA case study as what it was, not as a yes (%s)', (lang) => {
    const cited = COPY[lang].services.pages.cloudMigration.faq.filter((entry) => NDA.test(entry.answer));
    expect(cited).not.toHaveLength(0);
    for (const entry of cited) {
      expect(entry.answer).not.toMatch(YES);
      expect(entry.answer).toMatch(MODERNIZATION[lang]);
    }
  });
});

describe('the consulting FAQ', () => {
  // The site offers software, cloud and DevOps projects; it never says the consultants deliver them,
  // nor that they are delivered in-house ("мы сами").
  const SAME_TEAM: Record<Lang, RegExp> = {
    en: /same team/i,
    lv: /tā pati komanda/i,
    ru: /та же команда|мы сами/i,
  };

  it.each(LOCALES)('claims no team structure the site never described (%s)', (lang) => {
    for (const entry of COPY[lang].services.pages.consulting.faq) expect(entry.answer).not.toMatch(SAME_TEAM[lang]);
  });
});

describe('the AI integration FAQ', () => {
  // The answer deploys the model, so the question cannot say it is already live.
  const DEPLOY_ANSWER = /^We deploy it/;
  const index = enServices.pages.aiIntegration.faq.findIndex((entry) => DEPLOY_ANSWER.test(entry.answer));
  const ALREADY_LIVE: Record<Lang, RegExp> = { en: /\blive\b/i, lv: /palaist|darbojas/i, ru: /запуск/i };

  it.each(LOCALES)('asks about a built model, not a live one (%s)', (lang) => {
    expect(index).toBeGreaterThanOrEqual(0);
    expect(COPY[lang].services.pages.aiIntegration.faq[index].question).not.toMatch(ALREADY_LIVE[lang]);
  });
});
