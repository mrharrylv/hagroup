/** Latvian copy for the business surfaces: the supplier page and the demo dashboard. */
export const LV_BUSINESS: Readonly<Record<string, string>> = {
  // dash.* — internal ops console: headings, table columns, empty states.
  'dash.byCategory': 'Pēc kategorijas',
  'dash.byRegion': 'Pēc reģiona',
  'dash.campaign': 'Koppirkums',
  'dash.category': 'Kategorija',
  'dash.city': 'Pilsēta',
  'dash.closing': 'Drīz beidzas, mērķis nav sasniegts',
  'dash.closingEmpty': 'Šonedēļ neviens koppirkums nebeidzas ar nesasniegtu mērķi.',
  'dash.closingHint': 'beidzas 7 dienu laikā',
  'dash.colBuyers': 'Pircēji',
  'dash.colCampaigns': 'Koppirk.',
  'dash.colSaving': 'Vid. ietaup.',
  'dash.colShare': 'Pircēju daļa',
  'dash.colUnits': 'Vienības',
  'dash.daysLeft': 'Atlikušās dienas',
  'dash.eyebrow': 'Iekšējā demo konsole',
  'dash.groupEmpty': 'Pagaidām nav koppirkumu, ko apkopot.',
  'dash.groupNote':
    'Vienību kopsummas apvieno litrus, tonnas, m³ un paletes. Vidējais ietaupījums ir vienkāršs vidējais aritmētiskais uz vienu koppirkumu.',

  // dash.kpi.* — the metric tiles and their hints.
  'dash.kpi': 'Galvenie skaitļi',
  'dash.kpi.buyers': 'Pircēji',
  'dash.kpi.buyersHint': 'apņemšanās visos koppirkumos',
  'dash.kpi.campaigns': 'Koppirkumi',
  'dash.kpi.campaignsHint': 'sākotnējie + šeit izveidotie',
  'dash.kpi.open': 'Atvērti tagad',
  'dash.kpi.openHint': 'vēl pieņem dalībniekus',
  'dash.kpi.progress': 'Vid. izpilde',
  'dash.kpi.progressHint': 'vidēji pret katra koppirkuma mērķi',
  'dash.kpi.saving': 'Atslēgtais ietaupījums',
  'dash.kpi.savingHint': 'pret pirkumu vienatnē mazumtirdzniecībā',
  'dash.kpi.value': 'Apsolītā vērtība',
  'dash.kpi.valueHint': 'pēc līdz šim atslēgtajiem cenu līmeņiem',

  // dash.* — your own demo activity, status breakdown, reset.
  'dash.mine': 'Jūsu demo aktivitāte',
  'dash.mineEmpty':
    'Pagaidām nav ne jūsu apņemšanos, ne izveidotu koppirkumu. Pievienojieties koppirkumam, un tas parādīsies šeit.',
  'dash.mineHint':
    'Pievienošanās un koppirkumi tiek glabāti tikai šajā pārlūkā — nekas netiek nekur sūtīts.',
  'dash.needed': 'Līdz nākamajam līmenim',
  'dash.progress': 'Izpilde',
  'dash.region': 'Reģions',
  'dash.reset': 'Atiestatīt demo datus',
  'dash.resetConfirm':
    'Atiestatīt demo? Tas dzēsīs šajā pārlūkā saglabātos koppirkumus un jūsu pievienošanās.',
  'dash.role': 'Jūsu loma',
  'dash.roleBuyer': 'Pircējs',
  'dash.roleOrganiser': 'Organizators',
  'dash.skipped': 'saglabātiem koppirkumiem nav cenu līmeņu, un tie nav iekļauti šajos skaitļos.',
  'dash.status': 'Sadalījums pēc statusa',
  'dash.statusCol': 'Statuss',
  'dash.statusEmpty': 'Pagaidām nav koppirkumu, ko sadalīt.',
  'dash.subtitle':
    'Katrs zemāk redzamais skaitlis ir iegūts no šajā pārlūkā esošajiem demo koppirkumiem. Šeit nav reālu tirdzniecības datu.',
  'dash.title': 'Tirgus panelis',
  'dash.yourUnits': 'Jūsu vienības',

  // suppliers.badge / suppliers.bids.* — the bidding panel and its form.
  'suppliers.badge': 'Piegādātājiem',
  'suppliers.bids.buyers': 'Pircēji',
  'suppliers.bids.cancel': 'Atcelt',
  'suppliers.bids.daysShort': 'd.',
  'suppliers.bids.empty': 'Visiem atvērtajiem koppirkumiem jau ir piegādātāju piedāvājumi.',
  'suppliers.bids.existing': 'Piedāvājumi līdz šim',
  'suppliers.bids.formLabel': 'Iesniegt piedāvājumu',
  'suppliers.bids.leadTime': 'Piegādes termiņš (dienas)',
  'suppliers.bids.note': 'Lielākie apjomi ar mazu piegādātāju interesi vai bez tās.',
  'suppliers.bids.price': 'Cena tagad',
  'suppliers.bids.pricePerUnit': 'Cena par vienību (EUR)',
  'suppliers.bids.received': 'Piedāvājums saņemts — organizators tiks informēts.',
  'suppliers.bids.send': 'Nosūtīt piedāvājumu',
  'suppliers.bids.submit': 'Iesniegt piedāvājumu',
  'suppliers.bids.supplier': 'Piegādātāja nosaukums',
  'suppliers.bids.title': 'Atvērti piedāvājumiem',
  'suppliers.bids.volume': 'Apsolīts',

  // suppliers.board.* — the demand board table.
  'suppliers.board.caption': 'Atvērtais pieprasījums, grupēts pēc produktu kategorijas.',
  'suppliers.board.empty': 'Šobrīd nav atvērtu koppirkumu. Pēc brīža ieskatieties kartē vēlreiz.',
  'suppliers.board.note': 'Tikai atvērtie koppirkumi, sākot ar lielāko pieprasījumu.',
  'suppliers.board.title': 'Pieprasījuma panelis',
  'suppliers.board.valueAt': 'aptuveni',

  // suppliers.hero.* / suppliers.how.* — the commercial argument.
  'suppliers.hero.body':
    'Pircēji visā Latvijā apvieno savu pieprasījumu, pirms prasa cenu. Jūs vienreiz nosaucat cenu, vienreiz piegādājat un vienreiz izrakstāt rēķinu — par apjomu, kas jau pastāv.',
  'suppliers.hero.cta': 'Skatīt aktuālo pieprasījumu',
  'suppliers.hero.demo': 'Demo dati — nekas no šī nav reāls pasūtījums.',
  'suppliers.hero.title': 'Koncentrēts pieprasījums, viena piegāde, viens rēķins.',
  'suppliers.how.title': 'Kā darbojas piedāvājums',

  // suppliers.listing.* — the become-a-supplier form.
  'suppliers.listing.body':
    'Pastāstiet, ko un kur piegādājat, un koppirkumi šajās kategorijās nonāks pie jums pirmajiem.',
  'suppliers.listing.categories': 'Kategorijas, ko piegādājat',
  'suppliers.listing.company': 'Uzņēmums',
  'suppliers.listing.contact': 'Kontakti (e-pasts vai tālrunis)',
  'suppliers.listing.demo': 'Tikai demo — šī veidlapa neko nenosūta un nesaglabā.',
  'suppliers.listing.regions': 'Aptvertie reģioni',
  'suppliers.listing.selected': 'Izvēlēts',
  'suppliers.listing.send': 'Nosūtīt pieteikumu',
  'suppliers.listing.thanks': 'Paldies — reālajā produktā mēs sazinātos divu darba dienu laikā.',
  'suppliers.listing.title': 'Kļūstiet par reģistrētu piegādātāju',

  // suppliers.stat.* / suppliers.why.* — headline numbers above the board.
  'suppliers.stat.buyers': 'Gaidošie pircēji',
  'suppliers.stat.buyersHint': 'Apņemšanās visos atvērtajos koppirkumos.',
  'suppliers.stat.campaigns': 'Atvērtie koppirkumi',
  'suppliers.stat.value': 'Pieejamais pieprasījums',
  'suppliers.stat.valueHint': 'Apsolītais apjoms pēc šodienas cenu līmeņa.',
  'suppliers.why.title': 'Ko iegūst piegādātāji',

  // Demand board column headings.
  'suppliers.board.category': 'Kategorija',
  'suppliers.board.open': 'Atvērti',
  'suppliers.board.demand': 'Pieprasījums',
  'suppliers.board.buyers': 'Pircēji',
  'suppliers.board.best': 'Labākais līmenis tagad',
  'suppliers.board.regions': 'Reģioni',

  // How a bid works — the four steps.
  'suppliers.how.1': 'Pieprasījums uzkrājas, pircējiem apsolot apjomu koppirkumam.',
  'suppliers.how.2': 'Organizators slēdz koppirkumu, tiklīdz sasniegts mērķis vai termiņš.',
  'suppliers.how.3': 'Piegādātāji piedāvā cenu par apstiprināto apjomu — cena par vienību un piegādes termiņš.',
  'suppliers.how.4': 'Tiek saplānota viena piegāde, un katrs pircējs saņem rēķinu par savu daļu.',

  // Why suppliers win — the five benefit cards.
  'suppliers.why.1.title': 'Koncentrēts pieprasījums',
  'suppliers.why.1.body': 'Viens koppirkums četrdesmit izkaisītu pieprasījumu vietā, no kuriem katram bija vajadzīgs savs piedāvājums.',
  'suppliers.why.2.title': 'Mazāk pārdošanas darba uz katru eiro',
  'suppliers.why.2.body': 'Nekādu aukstu zvanu un braucienu uz vietu vienas paletes dēļ. Pircēji jau ir sapulcējušies.',
  'suppliers.why.3.title': 'Lielāki konsolidēti pasūtījumi',
  'suppliers.why.3.body': 'Apsolītais apjoms pienāk kā viens pasūtījums, tāpēc ir vērts piedāvāt īstu vairumtirdzniecības cenu.',
  'suppliers.why.4.title': 'Zemākas loģistikas izmaksas uz vienību',
  'suppliers.why.4.body': 'Viens maršruts apkalpo daudzus pircējus vienā apkaimē, tāpēc piegādes izmaksas sadalās uz visu kravu.',
  'suppliers.why.5.title': 'Piedāvājiet cenu reālam pieprasījumam',
  'suppliers.why.5.body': 'Jūs rēķināt cenu apstiprinātām apņemšanām, nevis prognozējat, ko sezona varētu atnest.',
};
