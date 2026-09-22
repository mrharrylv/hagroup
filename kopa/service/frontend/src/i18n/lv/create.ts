/** Latvian copy for the create surfaces: the "Sākt koppirkumu" form, its tier
 *  editor, the live preview column, validation and the success screen. */
export const LV_CREATE: Readonly<Record<string, string>> = {
  // create.contact — the demo-only warning above the contact block
  'create.contact.demoNote':
    'Tikai demo — kontaktinformācija paliek šajā pārlūkā. Nekas netiek nosūtīts ne e-pastā, ne īsziņā, ne arī kādam piegādātājam.',

  // create.done — the success screen that replaces the form
  'create.done.another': 'Izveidot vēl vienu',
  'create.done.asBuyersSeeIt': 'Kā to redz pircēji',
  'create.done.body':
    'Tas uzreiz parādās kartē un sarakstos. Dalieties ar saiti un vērojiet, kā cena krīt, pircējiem pievienojoties.',
  'create.done.demoNote':
    'Demo versija. Koppirkums tiek glabāts tikai šajā pārlūkā, un ievadītā kontaktinformācija nekur netika nosūtīta.',
  'create.done.onMap': 'Skatīt kartē',
  'create.done.title': 'Jūsu koppirkums ir atvērts',
  'create.done.view': 'Skatīt savu koppirkumu',

  // create.field — labels (nominative noun phrases), hints (full sentences)
  // and placeholders (example values, left as Latvian sample data)
  'create.field.audience': 'Kam pieejams',
  'create.field.byBuyers': 'Pircēju skaits',
  'create.field.byVolume': 'Kopējais apjoms',
  'create.field.category': 'Produkta kategorija',
  'create.field.city': 'Tuvākā pilsēta vai novads',
  'create.field.company': 'Uzņēmuma nosaukums',
  'create.field.companyHint': 'Nav obligāts — atstājiet tukšu, ja pērkat kā privātpersona.',
  'create.field.companyPlaceholder': 'SIA Kurzemes Koks',
  'create.field.contactName': 'Kontaktpersona',
  'create.field.contactNamePlaceholder': 'Ilze Bērziņa',
  'create.field.days': 'dienas',
  'create.field.description': 'Apraksts',
  'create.field.descriptionHint':
    'Kvalitāte, piegādes laiks un viss pārējais, kas piegādātājam jāzina, gatavojot piedāvājumu.',
  'create.field.descriptionPlaceholder':
    'Oktobrī jāpiegādā līdz pagalmam visā piegādes rādiusā. Paletes ar 65 × 15 kg maisiem.',
  'create.field.email': 'E-pasts',
  'create.field.emailPlaceholder': 'demo@example.lv',
  'create.field.length': 'Koppirkuma ilgums',
  'create.field.optional': 'Nav obligāts',
  'create.field.ownUnits': 'Jūsu apņemšanās',
  'create.field.ownUnitsHint':
    'Dod koppirkumam sākuma apjomu, lai tas nesāktos no nulles. Ierakstiet 0, ja tikai organizējat.',
  'create.field.phone': 'Tālrunis',
  'create.field.phonePlaceholder': '+371 20 000 000',
  'create.field.product': 'Produkta nosaukums',
  'create.field.productHint': 'To pircēji ierauga kartē, piemēram, „A1 koksnes granulas, 6 mm“.',
  'create.field.productPlaceholder': 'A1 koksnes granulas, 6 mm',
  'create.field.radius': 'Piegādes rādiuss',
  'create.field.radiusHint': 'Cik tālu pircējs var atrasties, lai piegāde vēl būtu izdevīga.',
  'create.field.retail': 'Mazumtirdzniecības cena par vienību',
  'create.field.retailHint': 'Cik maksātu viens pircējs atsevišķi. Pret to rēķina ietaupījumu.',
  'create.field.targetBuyers': 'Vēlamais pircēju skaits',
  'create.field.targetUnits': 'Vēlamais kopējais apjoms',
  'create.field.tierBasis': 'Līmeņus mēra pēc',
  'create.field.tierBasisHint':
    'Apjoms der degvielai un lielapjoma precēm; pircēju skaits — cenai par vienu piegādes reizi.',
  'create.field.tiers': 'Cenu kāpnes',
  'create.field.tiersHint': 'Vismaz trīs rindas, lai pircēji redzētu, kur ir nākamais cenas kritums.',
  'create.field.unit': 'Mērvienība',
  'create.field.unitHint': 'Visu — mērķus, līmeņus un cenas — rēķina šajā mērvienībā.',
  'create.field.youAre': 'Jūs esat',

  // create.issue — the validation summary, both halves counted by a number
  'create.issue.many': 'lietas, kas jāsakārto pirms publicēšanas',
  'create.issue.one': 'lieta, kas jāsakārto pirms publicēšanas',

  // create.preview — the sticky card column beside the form
  'create.preview.bestPrice': 'Zemākā iespējamā cena',
  'create.preview.bestSaving': 'Lielākais ietaupījums',
  'create.preview.demoNote':
    'Demo versija — šis koppirkums pastāv tikai jūsu pārlūkā, un nevienam nekas netiek sūtīts.',
  'create.preview.hint': 'Šo kartīti redz pircēji. Tā atjaunojas, jums rakstot.',
  'create.preview.ladder': 'Jūsu cenu kāpnes',
  'create.preview.nothingSaved': 'Vēl nekas nav saglabāts',
  'create.preview.title': 'Priekšskatījums',
  'create.preview.untitled': 'Jūsu koppirkums',
  'create.preview.you': 'Jūs',

  // create.pricing — step 3 heading and its lead
  'create.pricing.hint':
    'Cenu kāpnes ir visa mehānisma kodols: jo vairāk grupa apsola, jo mazāk maksā ikviens.',
  'create.pricing.title': 'Cena un kontakti',

  // create.submit — the publish button and the note under it
  'create.submit': 'Publicēt koppirkumu',
  'create.submitNote': 'Demo versija — publicētais koppirkums tiek saglabāts tikai šajā pārlūkā.',

  // create.subtitle — the page lead
  'create.subtitle':
    'Aprakstiet, kas jums vajadzīgs, atzīmējiet vietu kartē un nosakiet cenu kāpnes. Pievienojas kaimiņi un tuvējie uzņēmumi, un cena par vienību krīt visiem.',

  // create.tier — the ladder editor: column heads, row controls, buttons
  'create.tier.add': '+ Pievienot līmeni',
  'create.tier.buyersNoun': 'pircēji',
  'create.tier.from': 'No',
  'create.tier.noLimit': 'bez ierobežojuma',
  'create.tier.pricePerUnit': 'Cena / vienība',
  'create.tier.remove': 'Noņemt līmeni',
  'create.tier.reseed': 'Atiestatīt no mazumcenas',
  'create.tier.rowFrom': 'Līmenis',
  'create.tier.save': 'Atlaide',
  'create.tier.upTo': 'Līdz',

  // create.title — the page heading
  'create.title': 'Sākt koppirkumu',

  // create.what — step 1
  'create.what.hint':
    'Izvēlieties produktu un nosakiet mērķi. Tieši mērķis atver zemāko cenu līmeni.',
  'create.what.title': 'Kas',

  // create.where — step 2, the pin and the catchment circle
  'create.where.hint':
    'Pircēji apļa iekšpusē koppirkumu ierauga pirmie. Noklikšķiniet uz kartes vai pavelciet atzīmi, lai to pārvietotu.',
  'create.where.pin': 'Atzīme',
  'create.where.pinHint': 'noklikšķiniet uz kartes vai pavelciet atzīmi, lai to pārvietotu',
  'create.where.title': 'Kur',
};
