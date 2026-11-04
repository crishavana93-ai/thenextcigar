/**
 * Editorial guides for the busiest /lounge/map/<city>/ pages.
 * Facts only, each section sourced; no prices, no buying advice, no taste
 * verdicts (KOVFS 2024:2 — see project doc TOBACCO_LEGAL_NOTES). The venue
 * list on the page stays the data; this adds what a visitor needs to know.
 * Keys are citySlug(city, country). Bodies are trusted HTML written here.
 */
export interface CityGuide {
  updated: string; // YYYY-MM-DD, shown as "Checked …"
  lede: string; // one paragraph under the headline
  sections: { h: string; body: string }[];
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
}

export const CITY_GUIDES: Record<string, CityGuide> = {
  amsterdam: {
    updated: "2026-11-04",
    lede: "The Netherlands is one of the strictest places in Europe for indoor smoking: smoking rooms in bars, cafés and restaurants have been banned since a supreme court ruling in September 2019, so in Amsterdam hospitality venues allow smoking only on terraces that meet the inspectorate's conditions.",
    sections: [
      {
        h: "The rules in Amsterdam",
        body: `<p>The Tobacco and Smoking Products Act (Tabaks- en rookwarenwet) bans smoking in public spaces and hospitality, and since 1 July 2020 the ban also covers e-cigarettes.</p>
<ul>
<li><b>Smoking rooms:</b> on 27 September 2019 the Hoge Raad (supreme court) ruled that smoking rooms in hospitality breach the WHO tobacco treaty. The food safety authority (NVWA) has fined venues from 1 April 2020, with fines of €600 to €4,500. Smoking rooms in public buildings closed from 1 July 2021, and in other workplaces from 1 January 2022.</li>
<li><b>Terraces:</b> hospitality venues may allow smoking only on terraces that meet NVWA conditions.</li>
<li><b>Age:</b> you must be 18.</li>
</ul>
<p>We could not confirm any exemption for cigar lounges or private clubs. If a venue on this page mentions a smoking area, ask how it is set up before you go.</p>`,
      },
      {
        h: "Recent changes",
        body: `<ul><li>Since 1 July 2024, supermarkets and hospitality venues may no longer sell tobacco.</li><li>From 2025, playgrounds, almost all sports clubs and all hospitals are smoke-free.</li></ul>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar indoors in Amsterdam?", a: "Not in bars, cafés or restaurants. Smoking rooms in Dutch hospitality have been banned since the supreme court ruling of 27 September 2019, and fines have been issued since 1 April 2020. Smoking is allowed only on terraces that meet NVWA conditions." },
      { q: "Can you buy cigars in Dutch supermarkets?", a: "No. Since 1 July 2024 supermarkets and hospitality venues may not sell tobacco; specialist tobacco shops still can." },
      { q: "What is the smoking age in the Netherlands?", a: "18." },
    ],
    sources: [
      { label: "Rijksoverheid: discouraging smoking", url: "https://www.rijksoverheid.nl/onderwerpen/roken/roken-ontmoedigen" },
      { label: "Parliamentary paper on the Hoge Raad ruling (18 Oct 2019)", url: "https://zoek.officielebekendmakingen.nl/kst-32011-72.pdf" },
      { label: "VNG factsheet: closing smoking rooms (2021)", url: "https://vng.nl/sites/default/files/2021-08/factsheet-sluiting-rookruimtes.pdf" },
      { label: "Staatsblad 2024, 89: sales ban", url: "https://zoek.officielebekendmakingen.nl/stb-2024-89.pdf" },
      { label: "KHN: smoking ban", url: "https://www.khn.nl/website/kennispaginas/rookverbod" },
    ],
  },
  brussels: {
    updated: "2026-11-04",
    lede: "Belgium still allows smoking rooms (fumoirs) in bars and restaurants, within strict limits. A ban on fumoirs and terrace smoking planned for 1 January 2027 was postponed in October 2026, and no new date has been set.",
    sections: [
      {
        h: "The rules in Brussels",
        body: `<p>The law of 22 December 2009, in force since 1 January 2010, bans smoking in places open to the public. Article 6 allows a smoking room if:</p>
<ul>
<li>it takes up no more than a quarter of the venue's floor area;</li>
<li>it has smoke extraction or ventilation;</li>
<li>it is not a passageway and is clearly signed;</li>
<li>only drinks are taken into it.</li>
</ul>
<p><b>Age:</b> you must be 18, and since 2025 sellers must ask the buyer's age.</p>`,
      },
      {
        h: "What is changing",
        body: `<p>In September 2025 the federal government approved a draft bill banning fumoirs in places open to the public and smoking on terraces, from 1 January 2027. After remarks from the Council of State it will not start on that date; in October 2026 no new date had been given.</p>
<p>Already in force since 2025: no tobacco on display in shops, no sales in shops over 400 m² or at temporary sales points, and age checks at the till.</p>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar in a bar in Brussels?", a: "Only in a smoking room (fumoir) that meets Belgian law: no more than a quarter of the floor area, ventilated, signed, not a passageway, and drinks only. Elsewhere indoors, smoking is banned." },
      { q: "Is Belgium banning smoking on terraces?", a: "A ban on terrace smoking and fumoirs was planned for 1 January 2027, but in October 2026 it was postponed after the Council of State's remarks, with no new date." },
      { q: "What is the smoking age in Belgium?", a: "18." },
    ],
    sources: [
      { label: "Law of 22 Dec 2009 (FPS Employment, consolidated)", url: "https://werk.belgie.be/sites/default/files/content/documents/Bien-%C3%AAtre%20au%20travail/R%C3%A9glementation/Loi%20du%2022%20d%C3%A9cembre%202009_fumer.pdf" },
      { label: "Belgian government, draft bill (15 Sep 2025)", url: "https://news.belgium.be/fr/node/41087/pdf" },
      { label: "Paris Match Belgique, terrace ban postponed (26 Oct 2026)", url: "https://www.parismatch.be/actualites/societe/2026/10/26/linterdiction-de-fumer-en-terrasse-reportee-apres-des-remarques-du-conseil-detat-RHO3374CGZBNLLAVVQ6JN7PJVI/" },
      { label: "Belgian police, 2025 rules (7 Jan 2025)", url: "https://www.police.be/5331/node/13020" },
    ],
  },
  helsinki: {
    updated: "2026-11-04",
    lede: "Finland bans smoking in all restaurants, but a restaurant may have a sealed smoking room built to national standards. You may only smoke in it: no food, drinks or games, and short stays.",
    sections: [
      {
        h: "The rules in Helsinki",
        body: `<p>The Tobacco Act (549/2016), in force since 15 August 2016, bans smoking in restaurants. A restaurant may have a smoking room (tupakointitila):</p>
<ul>
<li><b>Built to Government Decree 601/2016:</b> at least 7 m², airtight, at negative pressure, with its own exhaust duct above the roof, and visible from outside or otherwise supervised.</li>
<li><b>Used only for smoking:</b> no food, drink or games inside, short stays only, and staff enter only for safety tasks.</li>
<li><b>Age:</b> you must be 18 to buy tobacco.</li>
</ul>
<p>A national working group has proposed removing restaurant smoking rooms and banning smoking on terraces; we could not confirm that this has been adopted.</p>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar in a Helsinki restaurant?", a: "Only in a sealed smoking room built to Government Decree 601/2016, and only to smoke: food, drink and games are not allowed in it." },
      { q: "What is the smoking age in Finland?", a: "18." },
    ],
    sources: [
      { label: "Ministry of Social Affairs and Health: Tobacco Act 2016", url: "https://stm.fi/-/tupakkalaki-tiukentuu-uusi-laki-voimaan-15-8-2016" },
      { label: "Government Decree 601/2016 (Finlex)", url: "https://finlex.fi/api/media/statute/67994/mainPdf/main.pdf" },
      { label: "Suomen ASH: smoking in restaurants", url: "https://suomenash.fi/en/tobacco-policy/tobacco-act/smoking-in-restaurants/" },
      { label: "Government proposal HE 219/2016 (age limit)", url: "https://www.edilex.fi/he/20160219" },
    ],
  },
  copenhagen: {
    updated: "2026-11-04",
    lede: "Denmark is more permissive than most of Europe: bars and restaurants may have smoking rooms, and small traditional pubs under 40 m² may allow smoking throughout.",
    sections: [
      {
        h: "The rules in Copenhagen",
        body: `<p>The Smoke-Free Environments Act (Lov om røgfri miljøer) bans smoking indoors where food or drink is served, with two exceptions:</p>
<ul>
<li><b>Smoking rooms and cabins:</b> allowed if well ventilated and not a passageway. Nothing may be served inside them, but guests may bring their own drinks in.</li>
<li><b>Small pubs (bodegas):</b> smoking may be allowed in a traditional pub that has an alcohol licence, serves no proper meals, and has a serving area under 40 m² with tables and chairs. A pub sharing a building with another venue needs its own street entrance.</li>
<li><b>Age:</b> you must be 18 to buy tobacco.</li>
</ul>
<p>The Act has no specific rule for cigar clubs or tobacco shops, so the general rules apply.</p>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar in a bar in Copenhagen?", a: "In a small traditional pub under 40 m² that allows smoking, or in a ventilated smoking room or cabin where nothing is served but you may bring your own drink. Elsewhere indoors, smoking is banned where food or drink is served." },
      { q: "What is the smoking age in Denmark?", a: "18." },
    ],
    sources: [
      { label: "Smoke-Free Environments Act, LBK 1632 of 2021 (Retsinformation)", url: "https://www.retsinformation.dk/eli/lta/2021/1632/pdf" },
      { label: "Act 1088 of 2024 (Retsinformation)", url: "https://www.retsinformation.dk/eli/lta/2024/1088/pdf" },
    ],
  },
  milan: {
    updated: "2026-11-04",
    lede: "Milan has two layers of rules: Italy's national indoor ban, which still allows properly built smoking rooms, and since 1 January 2025 a city ban on smoking in outdoor public areas, streets included, unless you can stand 10 metres from other people.",
    sections: [
      { h: "Indoors: Italy's smoking rooms", body: `<p>Italy's smoking ban (Law 3 of 16 January 2003, article 51, the "Sirchia law") has applied to enclosed places since 10 January 2005. It allows two exceptions: private premises not open to the public, and signed smoking rooms.</p>
<p>A smoking room must meet the technical rules of the decree of 23 December 2003:</p>
<ul>
<li>full-height walls on all sides and a self-closing door, and it must not be a passage non-smokers have to use;</li>
<li>forced ventilation of at least 30 litres per second per person, no recirculated air and negative pressure;</li>
<li>an "Area per fumatori" sign, and in a bar or restaurant less than half of the service area.</li>
</ul>
<p><b>Age:</b> you must be 18 to buy tobacco, and sellers must ask for ID unless the buyer is clearly an adult.</p>` },
      { h: "Outdoors: Milan's city ban", body: `<p>Since 1 January 2025, Milan's Air Quality Regulation has banned smoking in all outdoor public areas, including streets, except in isolated spots where you can keep 10 metres from other people. E-cigarettes are not covered by the ban. In practice, a cigar in Milan means a smoking room or a private space.</p>` },
    ],
    faq: [
      { q: "Can you smoke a cigar outside in Milan?", a: "Generally not in public outdoor areas: since 1 January 2025 Milan bans smoking in streets and other outdoor public spaces unless you are at least 10 metres from other people." },
      { q: "Are cigar lounges legal in Italy?", a: "Yes, if they are built as smoking rooms under the 2003 decree: enclosed on all sides with a self-closing door, mechanically ventilated at negative pressure, and signed. In bars and restaurants the room must be less than half of the service area." },
      { q: "What is the smoking age in Italy?", a: "18. Sellers must ask for ID unless the buyer is clearly an adult." },
    ],
    sources: [
      { label: "Law 3/2003, art. 51 (University of Perugia copy)", url: "https://WWW.UNIPG.IT/files/pagine/448/nonfumatori/Art_51_Legge_3_2003.pdf" },
      { label: "DPCM 23 Dec 2003, smoking-room standards (ISS EpiCentro)", url: "https://www.epicentro.iss.it/fumo/pdf/23%20dicembre%202003.pdf" },
      { label: "D.L. 158/2012, art. 7 (ADM)", url: "https://www.adm.gov.it/portale/documents/20182/6661054/dl+n.+158+del+2012+art+7.pdf/39a0d9bc-0bf2-4856-b8b0-5c584d606f2a" },
      { label: "AGI, Milan outdoor smoking ban from 1 Jan 2025 (26 Dec 2024)", url: "https://www.agi.it/cronaca/news/2024-12-26/milano-divieto-di-fumo-da-1-gennaio-29306343/" },
    ],
  },
  rome: {
    updated: "2026-11-04",
    lede: "In Rome a cigar indoors means a properly built smoking room: Italy's national ban has covered enclosed public places since 2005 but allows signed, mechanically ventilated smoking rooms. Unlike Milan, Rome had no city-wide outdoor ban when we checked.",
    sections: [
      { h: "Indoors: Italy's smoking rooms", body: `<p>Italy's smoking ban (Law 3 of 16 January 2003, article 51, the "Sirchia law") has applied to enclosed places since 10 January 2005. It allows two exceptions: private premises not open to the public, and signed smoking rooms.</p>
<p>A smoking room must meet the technical rules of the decree of 23 December 2003:</p>
<ul>
<li>full-height walls on all sides and a self-closing door, and it must not be a passage non-smokers have to use;</li>
<li>forced ventilation of at least 30 litres per second per person, no recirculated air and negative pressure;</li>
<li>an "Area per fumatori" sign, and in a bar or restaurant less than half of the service area.</li>
</ul>
<p><b>Age:</b> you must be 18 to buy tobacco, and sellers must ask for ID unless the buyer is clearly an adult.</p>` },
      { h: "Outdoors in Rome", body: `<p>We found no city-wide outdoor smoking ban in Rome. A ban on smoking on the beaches of Ostia, Capocotta and Castel Porziano was approved by the city's Environment Committee in March 2026 but still needed a vote in the city council (Assemblea Capitolina).</p>` },
    ],
    faq: [
      { q: "Can you smoke a cigar outside in Rome?", a: "We found no city-wide outdoor ban in Rome, unlike Milan. A beach ban for Ostia, Capocotta and Castel Porziano was still a proposal in March 2026." },
      { q: "Are cigar lounges legal in Italy?", a: "Yes, if they are built as smoking rooms under the 2003 decree: enclosed on all sides with a self-closing door, mechanically ventilated at negative pressure, and signed. In bars and restaurants the room must be less than half of the service area." },
      { q: "What is the smoking age in Italy?", a: "18. Sellers must ask for ID unless the buyer is clearly an adult." },
    ],
    sources: [
      { label: "Law 3/2003, art. 51 (University of Perugia copy)", url: "https://WWW.UNIPG.IT/files/pagine/448/nonfumatori/Art_51_Legge_3_2003.pdf" },
      { label: "DPCM 23 Dec 2003, smoking-room standards (ISS EpiCentro)", url: "https://www.epicentro.iss.it/fumo/pdf/23%20dicembre%202003.pdf" },
      { label: "D.L. 158/2012, art. 7 (ADM)", url: "https://www.adm.gov.it/portale/documents/20182/6661054/dl+n.+158+del+2012+art+7.pdf/39a0d9bc-0bf2-4856-b8b0-5c584d606f2a" },
      { label: "GreenMe, Rome beach smoking proposal (27 Mar 2026)", url: "https://www.greenme.it/ambiente/divieto-di-fumo-litorale-romano/" },
    ],
  },
  madrid: {
    updated: "2026-11-04",
    lede: "Spain has no cigar-lounge exemption for bars and restaurants: Law 28/2005 makes them smoke-free indoors. The legal way to smoke indoors is a private, non-profit smokers' club for members only, and a bill sent to parliament in July 2026 would also ban smoking on terraces.",
    sections: [
      {
        h: "The rules in Madrid",
        body: `<p>Law 28/2005 bans smoking in enclosed bars, restaurants and similar venues. Hotels may keep up to 30% of rooms for smokers, with separate ventilation.</p>
<p><b>Private smokers' clubs</b> are exempt only if all of these apply:</p>
<ul>
<li>smoking happens at the club's own registered premises, with only members present;</li>
<li>the club has its own legal personality and is non-profit;</li>
<li>it sells nothing to consume, so no food or drink is supplied;</li>
<li>minors are never admitted.</li>
</ul>
<p><b>Age:</b> you must be 18 to buy tobacco.</p>`,
      },
      {
        h: "What is changing",
        body: `<p>On 21 July 2026 the Spanish government approved a bill and sent it to parliament. It would ban smoking on bar and restaurant terraces, beaches, pools and outdoor venues, and within 15 metres of the entrances to public buildings, 20 days after publication. It was <b>not in force</b> when we checked.</p>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar in a bar in Madrid?", a: "No. Law 28/2005 makes enclosed bars and restaurants smoke-free. Indoors, smoking is legal in private, non-profit smokers' clubs for members only, which may not sell food or drink." },
      { q: "Can you still smoke on terraces in Spain?", a: "Yes, for now. A bill approved by the government on 21 July 2026 would ban it, but it was still before parliament when we checked." },
      { q: "What is the smoking age in Spain?", a: "18." },
    ],
    sources: [
      { label: "Law 28/2005, consolidated text (BOE)", url: "https://boe.es/buscar/pdf/2005/BOE-A-2005-21261-consolidado.pdf" },
      { label: "Consumo Responde: private smokers' clubs", url: "https://www.consumoresponde.es/art%C3%ADculos/los_clubes_privados_de_personas_fumadoras" },
      { label: "Ministry of Health, bill approved 21 Jul 2026", url: "https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6968" },
    ],
  },
  funchal: {
    updated: "2026-11-04",
    lede: "Portugal bans smoking in bars and restaurants but still allows sealed smoking rooms, and since 2023 the conditions are strict. On Madeira, the regional inspectorate applies the national 2022 rules to venues in Funchal.",
    sections: [
      {
        h: "The rules in Funchal",
        body: `<p>Law 37/2007 bans smoking in food and drink venues. A smoking room must be signed, physically enclosed, show its maximum occupancy, have independent extraction at negative pressure, and admit only adults; nothing may be served inside it.</p>
<p>Since 1 January 2023 (Portaria 154/2022), as Madeira's economic inspectorate (ARAE) applies it, a venue may only have a smoking room if:</p>
<ul>
<li>the venue is at least 100 m² with a ceiling of at least 3 m;</li>
<li>the room and its antechamber take up no more than 20% of the customer area;</li>
<li>the antechamber is at least 4 m², with automatic sliding doors that cannot open at the same time;</li>
<li>an engineer has certified the ventilation.</li>
</ul>
<p><b>Age:</b> you must be 18 and may be asked for photo ID.</p>`,
      },
      {
        h: "What may change",
        body: `<p>A 2023 government bill would have banned smoking on covered terraces and new smoking rooms, letting existing rooms stay until 2030. Parliament was dissolved before it passed, and we could not confirm that it has been enacted since.</p>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar indoors in Madeira?", a: "Only in a dedicated smoking room that meets Portugal's rules: in force since 2023, they require a venue of at least 100 m², a sealed room with an antechamber and certified ventilation, and no service inside." },
      { q: "Does Madeira have different smoking rules from mainland Portugal?", a: "Madeira adapted the national law in 2008, but in January 2023 the regional inspectorate announced it was applying the national Portaria 154/2022 rules." },
      { q: "What is the smoking age in Portugal?", a: "18, with photo ID." },
    ],
    sources: [
      { label: "Law 37/2007 (Portal das Finanças copy)", url: "https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_37_2007.pdf" },
      { label: "ARAE Madeira: changes to the tobacco law (Jan 2023)", url: "https://www.madeira.gov.pt//Portals/20/Users/245/45/245/Informa%c3%a7%c3%a3o%20-%20Altera%c3%a7%c3%a3o%20Lei%20do%20Tabaco%202022.pdf" },
      { label: "Government of Portugal: 2023 tobacco bill Q&A", url: "https://portugal.gov.pt/pt/gc23/comunicacao/noticias/geracao-sem-tabaco-ate-2040-perguntas-e-respostas-sobre-a-proposta-de-lei-do-governo" },
    ],
  },
  york: {
    updated: "2026-11-04",
    lede: "England has been smoke-free indoors since July 2007, so in York a cigar is an outdoor or shop-floor affair: on a terrace that is less than half enclosed, or in the sampling room of a specialist tobacconist that meets the legal conditions.",
    sections: [
      {
        h: "The rules in York",
        body: `<p>The Health Act 2006 made almost all enclosed public places and workplaces in England smoke-free from 1 July 2007, pubs and restaurants included. There is no general exemption for cigar lounges or cigar bars.</p>
<ul>
<li><b>Terraces and shelters:</b> a space with a roof counts as "substantially enclosed" if more than half its walls are closed. A smoking shelter must stay under that 50% line.</li>
<li><b>Tobacconists:</b> a specialist tobacconist may let customers sample cigars and pipe tobacco in a room with solid floor-to-ceiling walls, no ventilation or open door into smoke-free areas, and clear signs saying smoking is allowed.</li>
<li><b>Age:</b> you must be 18 to buy tobacco in the UK.</li>
</ul>`,
      },
      {
        h: "What is changing",
        body: `<p>The Tobacco and Vapes Act 2026 became law on 29 April 2026. It bans tobacco sales to anyone born on or after 1 January 2009, and gives ministers powers to extend smoke-free rules to some outdoor places. A consultation on those outdoor places opened in February 2026; when the sales ban starts had not been confirmed when we checked.</p>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar inside a bar in York?", a: "No. England's smoke-free law has covered pubs, bars and restaurants since 1 July 2007, and there is no exemption for cigar bars." },
      { q: "Where can you smoke a cigar in York?", a: "Outdoors, including on terraces or shelters that are less than 50% enclosed, and in the sampling room of a specialist tobacconist that meets the conditions in the Smoke-free (Exemptions and Vehicles) Regulations 2007." },
      { q: "Does the new UK generational ban affect adult visitors?", a: "It bans sales to people born on or after 1 January 2009. Older adults are not affected by that part of the Tobacco and Vapes Act 2026." },
    ],
    sources: [
      { label: "Smoke-free (Exemptions and Vehicles) Regulations 2007, reg. 7", url: "https://www.legislation.gov.uk/uksi/2007/765/regulation/7" },
      { label: "Dudley Council: the smoke-free law", url: "https://www.dudley.gov.uk/business/environmental-health/smokefree/the-smokefree-law" },
      { label: "Derby City Council: smoking shelters", url: "https://www.derby.gov.uk/trading-standards-environmental-health/environmental-health/smokefree/smoking-shelters" },
      { label: "GOV.UK: Tobacco and Vapes Bill becomes law (29 Apr 2026)", url: "https://www.gov.uk/government/news/tobacco-and-vapes-bill-becomes-law" },
    ],
  },
  "hong-kong": {
    updated: "2026-11-04",
    lede: "Hong Kong has banned smoking in indoor workplaces, restaurants and bars since 2007, and the last temporary exemptions ended on 1 July 2009. New rules from 1 January 2026 also ban smoking while queuing and near the entrances of schools and hospitals.",
    sections: [
      {
        h: "The rules in Hong Kong",
        body: `<p>Under the Smoking (Public Health) Ordinance (Cap. 371), the extended ban took effect on 1 January 2007. It covers indoor workplaces, public places, restaurants and bars, as well as beaches, pools, stadiums and most parks and playgrounds. Bars, nightclubs and a few other venue types were given until 1 July 2009 to comply.</p>
<p>We found no indoor exemption for cigar rooms in the official texts. If you plan to smoke at a venue on this page, ask the venue first what its premises allow.</p>
<ul><li><b>Age:</b> you must be 18; giving tobacco to anyone under 18 has also been banned since 19 September 2025.</li></ul>`,
      },
      {
        h: "What changed in 2026",
        body: `<ul>
<li><b>From 1 January 2026:</b> no smoking within 3 metres of entrances used only by schools, hospitals, child-care centres, care homes and some clinics; no smoking while queuing for public transport or to enter specified premises; the fixed penalty doubled from HK$1,500 to HK$3,000.</li>
<li><b>From 30 April 2026:</b> carrying alternative smoking products, such as heat sticks and e-liquids, in public places is banned.</li>
</ul>`,
      },
    ],
    faq: [
      { q: "Can you smoke a cigar indoors in Hong Kong?", a: "Indoor workplaces, restaurants and bars have been smoke-free since 2007, with the last temporary exemptions ending on 1 July 2009. We found no exemption for cigar rooms, so ask a venue before you go." },
      { q: "Can you smoke while queuing in Hong Kong?", a: "No. Since 1 January 2026 smoking is banned while queuing for public transport or to enter specified premises, and the fixed penalty is HK$3,000." },
      { q: "What is the smoking age in Hong Kong?", a: "18. Giving tobacco products to anyone under 18 has been banned since 19 September 2025." },
    ],
    sources: [
      { label: "Hong Kong Government press release, 31 Dec 2006", url: "https://www.info.gov.hk/gia/general/200612/31/P200612300237.htm" },
      { label: "Department of Health, 29 Jun 2009", url: "https://www.dh.gov.hk/english/press/2009/090629-3.html" },
      { label: "news.gov.hk, 29 Dec 2025", url: "https://www.news.gov.hk/eng/2025/12/20251229/20251229_115005_396.html" },
      { label: "Hong Kong Government press release, 22 Apr 2026", url: "https://www.info.gov.hk/gia/general/202604/22/P2026042200306p.htm" },
      { label: "Hong Kong Government press release, 19 Sep 2025", url: "https://www.info.gov.hk/gia/general/202509/19/P2025091900335p.htm" },
    ],
  },
};
