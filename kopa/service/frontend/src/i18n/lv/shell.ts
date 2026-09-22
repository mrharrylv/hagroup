/** Shared chrome: navigation, calls to action, badges, filters, units of time. */
export const LV_SHELL: Readonly<Record<string, string>> = {
  // nav.* — galvenā navigācija
  'nav.map': 'Karte',
  'nav.campaigns': 'Koppirkumi',
  'nav.start': 'Sākt koppirkumu',
  'nav.suppliers': 'Piegādātājiem',
  'nav.dashboard': 'Demo panelis',
  'nav.home': 'Sākums',

  // cta.* — pogas un darbības
  'cta.browse': 'Apskatīt koppirkumus',
  'cta.start': 'Sākt koppirkumu',
  'cta.join': 'Pievienoties',
  'cta.joinGroupBuy': 'Pievienoties koppirkumam',
  'cta.viewDetails': 'Skatīt detaļas',
  'cta.unlock': 'Atvērt zemāku cenu',
  'cta.back': 'Atpakaļ',
  'cta.cancel': 'Atcelt',
  'cta.confirm': 'Apstiprināt',
  'cta.reset': 'Atiestatīt',
  'cta.clear': 'Notīrīt visu',
  'cta.apply': 'Piemērot',
  'cta.close': 'Aizvērt',

  // search.* — meklēšana un atrasto skaits
  'search.placeholder': 'Meklēt granulas, dīzeli, mēslojumu…',
  'search.hits': 'atrasti',
  'search.noHits': 'Nekas netika atrasts',
  'search.clear': 'Notīrīt meklēšanu',
  'search.label': 'Meklēt koppirkumus',
  'search.match': 'atbilst',
  'search.of': 'no',
  'search.onMap': 'kartē',

  // filter.* — filtru sānjosla un filtru čipi
  'filter.all': 'Jebkāds',
  'filter.category': 'Kategorija',
  'filter.region': 'Reģions',
  'filter.city': 'Pilsēta',
  'filter.audience': 'Pircēji',
  'filter.unit': 'Mērvienība',
  'filter.status': 'Statuss',
  'filter.saving': 'Ietaupījums',
  'filter.radius': 'Piegādes rādiuss',
  'filter.participants': 'Dalībnieki',
  'filter.filters': 'Filtri',
  'filter.anyCity': 'Jebkura pilsēta',
  'filter.anyUnit': 'Jebkura mērvienība',
  'filter.remove': 'Noņemt šo filtru',
  'filter.within': 'Līdz',

  // filters.* — filtru panelis uz kartes
  'filters.any': 'Jebkāds',
  'filters.anyCity': 'Jebkura pilsēta',
  'filters.anyUnit': 'Jebkura mērvienība',
  'filters.audience': 'Kam paredzēts',
  'filters.city': 'Pilsēta',
  'filters.clearAll': 'Notīrīt visu',
  'filters.maxRadius': 'Maksimālais rādiuss',
  'filters.minParticipants': 'Mazākais dalībnieku skaits',
  'filters.minSaving': 'Mazākais ietaupījums',
  'filters.region': 'Reģions',
  'filters.status': 'Statuss',
  'filters.title': 'Filtri',
  'filters.unit': 'Mērvienība',

  // sort.* — kārtošana
  'sort.label': 'Kārtot pēc',

  // audience.* — kam koppirkums paredzēts
  'audience.business': 'Uzņēmumi',
  'audience.individual': 'Privātpersonas',
  'audience.mixed': 'Visi',
  'audience.business.one': 'uzņēmums',
  'audience.individual.one': 'privātpersona',

  // status.* — koppirkuma statuss
  'status.new': 'Jauns',
  'status.open': 'Atvērts',
  'status.almost-full': 'Gandrīz pilns',
  'status.closing-soon': 'Drīz beigsies',
  'status.funded': 'Mērķis sasniegts',
  'status.closed': 'Slēgts',

  // badge.* — nozīmītes uz kartītēm
  'badge.popular': 'Populārs',
  'badge.bestSaving': 'Labākais ietaupījums',
  'badge.joined': 'Jūs pievienojāties',
  'badge.yours': 'Jūsu koppirkums',

  // campaign.* — koppirkuma lauki
  'campaign.organizer': 'Organizators',
  'campaign.location': 'Atrašanās vieta',
  'campaign.radius': 'Rādiuss',
  'campaign.joined': 'Pievienojušies',
  'campaign.needed': 'Vēl vajag',
  'campaign.target': 'Mērķis',
  'campaign.committed': 'Apsolīts',
  'campaign.currentPrice': 'Pašreizējā cena',
  'campaign.retailPrice': 'Mazumtirdzniecības cena',
  'campaign.saving': 'Ietaupījums',
  'campaign.endsIn': 'Beidzas pēc',
  'campaign.days': 'dienām',
  'campaign.tiers': 'Cenu līmeņi',
  'campaign.participants': 'Dalībnieki',
  'campaign.faq': 'Biežāk uzdotie jautājumi',
  'campaign.nearby': 'Tuvumā',
  'campaign.description': 'Apraksts',
  'campaign.suppliers': 'Piegādātāju piedāvājumi',

  // tier.* — cenu kāpnes; "Vēl tikai 6 pircēji līdz cenai …"
  'tier.bestReached': 'Zemākā cena jau atvērta',
  'tier.buyers': 'Pircēji',
  'tier.current': 'Tagad',
  'tier.next': 'Nākamais',
  'tier.only': 'Vēl tikai',
  'tier.price': 'Cena',
  'tier.save': 'Ietaupījums',
  'tier.toUnlock': 'līdz cenai',
  'tier.volume': 'Kopējais apjoms',

  // stats.* — kopsavilkuma skaitļi
  'stats.allShown': 'visi',
  'stats.avgSaving': 'Vid. labākais ietaupījums',
  'stats.avgSavingHint': 'pie lētākā cenu līmeņa',
  'stats.buyers': 'Pievienojušies pircēji',
  'stats.of': 'no',
  'stats.shown': 'Koppirkumi',
  'stats.units': 'Apsolītais apjoms',

  // map.* — kartes vadīklas un sānu panelis
  'map.allLatvia': 'Visa Latvija',
  'map.emptyBody': 'Palieliniet rādiusu, noņemiet kādu filtru vai apskatiet visu Latviju.',
  'map.emptyTitle': 'Neviens koppirkums neatbilst šiem filtriem',
  'map.nearby': 'Tuvumā',
  'map.noNearby': 'Tuvumā pagaidām nav nekā cita.',
  'map.recentre': 'Parādīt visu Latviju',
  'map.selected': 'Izvēlētais koppirkums',
  'map.zoomHint': 'Pietuviniet vai izvēlieties reģionu, lai redzētu atsevišķus koppirkumus',
  'map.zoomIn': 'Pietuvināt',
  'map.zoomOut': 'Attālināt',

  // time.* — termiņi un laika vienības
  'time.daysLeft': 'dienas atlikušas',
  'time.dayLeft': 'diena atlikusi',
  'time.ended': 'Beidzies',
  'time.today': 'Beidzas šodien',
  'time.daysAgo': 'dienas iepriekš',
  'time.today.joined': 'šodien',
  'time.unit.days': 'dienas',
  'time.unit.hours': 'st.',
  'time.unit.minutes': 'min',
  'time.unit.seconds': 'sek',
  'time.yesterday': 'vakar',

  // a11y.* — tikai ekrānlasītājiem
  'a11y.breadcrumb': 'Navigācijas ceļš',
  'a11y.countdown': 'Atlikušais laiks, lai pievienotos',

  // footer.* — kājene
  'footer.about': 'Par mums',
  'footer.business': 'Uzņēmumiem',
  'footer.disclaimer':
    'Koncepta demo. Visi koppirkumi, cenas, dalībnieki un piegādātāji šajā vietnē ir izdomāti. Pasūtījumi netiek veikti un maksājumi netiek pieņemti.',
  'footer.mock': 'tikai demonstrācijas dati',
  'footer.platform': 'Platforma',
  'footer.tagline':
    'Latvijas koppirkumu platforma degvielai, granulām, būvmateriāliem un ne tikai.',

  'lang.toggle': 'EN',
};
