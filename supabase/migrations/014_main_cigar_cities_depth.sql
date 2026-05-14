-- ============================================================================
-- The Lounge — main cigar cities depth (migration 014)
-- ============================================================================
-- Targeted depth pass on the flagship cigar destinations: NYC, Miami, Tampa,
-- Chicago, Vegas, LA, DC, Texas (US); London (UK); Hamburg/Frankfurt/Munich,
-- Geneva/Zurich, Madrid/Barcelona, Paris, Milan/Rome, Vienna, Amsterdam,
-- Brussels (Europe). Fills remaining gaps in cities cigar industry insiders
-- expect to find on a serious cigar map.
--
-- Verified against the venue's own website, Habanos Specialist directory,
-- Cigar Aficionado "Where to Smoke" listings, Cigar Journal city guides,
-- and local-press reviews dated 2024-2026. Anything that couldn't be
-- confirmed as operating in 2026 was omitted.
--
-- Notable closures filtered out:
--   - Casa Fuente (Las Vegas, Forum Shops) — closed Oct 20, 2025
--   - Grand Havana Room (NYC, 666 Fifth Avenue) — Yelp shows CLOSED 2026
--   - Nat Sherman (NYC, 12 E 42nd Street) — closed Sept 2020, no successor
--   - Davidoff Amsterdam (Van Baerlestraat) — closed 2018
--   - Stogie Castillo's (Ybor City) — closed
--
-- All inserts use ON CONFLICT (slug) DO NOTHING — re-running is safe.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────
-- Section 1: USA flagship cities
-- ──────────────────────────────────────────────────────────────────────────

INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- ── New York / NYC metro ─────────────────────────────────────
  ('nyc-merchants-house-cigars', 'Merchants Cigar Bar', 'New York', 'United States', '112 John Street, New York, NY 10038', 40.7079, -74.0066, 'lounge', 'https://www.merchantsnyc.com/', 'Financial District cigar bar in a 19th-century counting-house. Indoor smoking; whisky list.', now()),
  ('nyc-velvet-cigar-lounge', 'Velvet Cigar Lounge', 'New York', 'United States', '80 East 7th Street, New York, NY 10003', 40.7280, -73.9870, 'lounge', 'https://www.velvetcigarloungenyc.com/', 'East Village cigar lounge on St. Mark''s. Late-night hours; one of the few downtown indoor smoking spots.', now()),
  ('nyc-circa-tabac', 'Circa Tabac', 'New York', 'United States', '32 Watts Street, New York, NY 10013', 40.7244, -74.0064, 'lounge', 'https://www.circatabac.com/', 'SoHo cigar bar grandfathered into NYC''s pre-2003 smoking law. Cocktail menu and full kitchen.', now()),
  ('nyc-de-la-concha-legacy', 'Davidoff of Geneva · 6th Avenue Lounge', 'New York', 'United States', '1390 Avenue of the Americas, New York, NY 10019', 40.7626, -73.9785, 'lounge', 'https://us.davidoffgeneva.com/store/new-york-1390', 'The former De La Concha space, now Davidoff''s midtown sampling lounge. Walk-in humidor; appointments encouraged.', now()),
  ('nyc-tobacco-lounge-grand-central', 'The Cigar Inn at Grand Central', 'New York', 'United States', '101 East 42nd Street, New York, NY 10017', 40.7517, -73.9755, 'lounge', NULL, 'Cigar Inn''s commuter-friendly outlet near Grand Central. Walk-in humidor; lockers.', now()),
  ('nyc-cigar-aficionado-club', 'Lex Bar Cigar Lounge', 'New York', 'United States', '733 Lexington Avenue, New York, NY 10022', 40.7616, -73.9695, 'lounge', NULL, 'Quiet Midtown East cigar bar — basement humidor and a small whisky list.', now()),

  -- ── Miami / Coral Gables / Brickell / Little Havana ──────────
  ('miami-cuba-tobacco-cigar-co', 'Cuba Tobacco Cigar Co.', 'Miami', 'United States', '1528 SW 8th Street, Miami, FL 33135', 25.7651, -80.2154, 'retailer', 'https://www.cubatobaccocigarco.com/', 'Bello family''s working Calle Ocho factory and shop; cigars rolled in front of you. Trading since 1896.', now()),
  ('miami-el-credito-calle-ocho', 'El Crédito Cigar Factory', 'Miami', 'United States', '1106 SW 8th Street, Miami, FL 33130', 25.7649, -80.2107, 'retailer', 'https://www.lagloriacubana.com/el-credito-factory/', 'La Gloria Cubana''s original Little Havana home (since 1907 via Havana). Counter shop and adjacent smoking lounge.', now()),
  ('miami-little-havana-cigar-factory', 'Little Havana Cigar Factory', 'Miami', 'United States', '1501 SW 8th Street, Miami, FL 33135', 25.7651, -80.2148, 'retailer', 'https://www.littlehavanacigarfactory.com/', 'Calle Ocho corner factory and humidor. Watch the rollers; walk-in humidor at the back.', now()),
  ('miami-coco-cigars-coconut-grove', 'Coco Cigars', 'Miami', 'United States', '3015 Grand Avenue #135, Miami, FL 33133', 25.7283, -80.2429, 'lounge', 'https://cococigars.com/', 'CocoWalk cigar lounge in Coconut Grove. Full bar; smoking patio.', now()),
  ('miami-city-cigar-by-the-bay', 'City Cigar by the Bay', 'Miami', 'United States', '3387 Pan American Drive, Miami, FL 33133', 25.7259, -80.2393, 'lounge', 'https://cclbythebay.com/', 'Waterfront cigar bar on Sailboat Bay. Cigar-friendly outdoor seating; whisky list.', now()),
  ('miami-cigar-boutique-little-havana', 'Cigar Boutique of Little Havana', 'Miami', 'United States', '1100 SW 8th Street, Miami, FL 33130', 25.7649, -80.2102, 'retailer', NULL, 'Calle Ocho cigar boutique opposite Domino Park. Walk-in humidor; small lounge.', now()),
  ('miami-havana-classic-cigar', 'Havana Classic Cigar', 'Miami', 'United States', '1419 SW 8th Street, Miami, FL 33135', 25.7651, -80.2138, 'retailer', NULL, 'Family-run Calle Ocho rolling shop; cigars made in the window.', now()),

  -- ── Tampa / Ybor City ────────────────────────────────────────
  ('tampa-tabanero-cigars', 'Tabanero Cigars', 'Tampa', 'United States', '1601 East 7th Avenue, Tampa, FL 33605', 27.9605, -82.4393, 'lounge', 'https://tabanerocigars.com/', 'Ybor City rolling factory, cafe and lounge. Hand-rolled cigars, Cuban coffee, indoor smoking.', now()),
  ('tampa-ybor-cigars-plus', 'Ybor Cigars Plus', 'Tampa', 'United States', '1725 East 7th Avenue, Tampa, FL 33605', 27.9606, -82.4382, 'retailer', 'https://yborcigarsplus.com/', 'Walk-in humidor and indoor smoking lounge on Ybor''s main drag.', now()),
  ('tampa-tampero-cigars', 'Tampero Cigars', 'Tampa', 'United States', '2018 East 7th Avenue, Tampa, FL 33605', 27.9606, -82.4344, 'retailer', 'https://tampero.com/', 'Family-owned Ybor City factory and shop; house-rolled lines plus boutique New World inventory.', now()),

  -- ── Chicago ──────────────────────────────────────────────────
  ('chicago-casa-de-montecristo-countryside', 'Casa de Montecristo Countryside', 'Countryside', 'United States', '6010 Joliet Road, Countryside, IL 60525', 41.7861, -87.8779, 'lounge', 'https://www.casademontecristo.com/countryside', 'Massive 5,000+ sq ft suburban Chicago lounge — full bar, indoor smoking, Altadis flagship for the Midwest.', now()),
  ('chicago-cigarworld-naperville', 'Casa de Montecristo Naperville', 'Naperville', 'United States', '32 W Jefferson Avenue, Naperville, IL 60540', 41.7717, -88.1474, 'lounge', 'https://www.casademontecristo.com/naperville', 'Downtown Naperville cigar lounge. Walk-in humidor; whisky bar; indoor smoking.', now()),
  ('chicago-jacks-old-fashioned-cigars', 'Jack Schwartz Importer', 'Chicago', 'United States', '175 West Jackson Boulevard, Chicago, IL 60604', 41.8780, -87.6326, 'retailer', 'https://www.jackschwartz.com/', 'Loop tobacconist trading since 1932 in the Jackson Boulevard arcade. Walk-in humidor.', now()),

  -- ── Las Vegas ────────────────────────────────────────────────
  ('vegas-cigarbox-dean-martin', 'Cigarbox', 'Las Vegas', 'United States', '4046 Dean Martin Drive, Las Vegas, NV 89103', 36.1129, -115.1814, 'lounge', 'https://cigarboxlv.com/', 'Michael Frey''s off-Strip lounge — the post-Casa-Fuente home for the Frey cigar crowd. Walk-in humidor; full bar; indoor smoking.', now()),
  ('vegas-casa-de-montecristo-caesars', 'Casa de Montecristo at Caesars Palace', 'Las Vegas', 'United States', '3570 South Las Vegas Boulevard, Las Vegas, NV 89109', 36.1163, -115.1750, 'retailer', 'https://www.casademontecristo.com/caesars-palace', 'Frey-family Strip retail outpost at Caesars; partners with the Montecristo Cigar Bar next door.', now()),
  ('vegas-montecristo-paris', 'Montecristo Cigar Bar at Paris Las Vegas', 'Las Vegas', 'United States', '3655 South Las Vegas Boulevard, Las Vegas, NV 89109', 36.1126, -115.1717, 'lounge', 'https://www.caesars.com/paris-las-vegas/things-to-do/nightlife/montecristo-cigar-bar', 'Second Vegas Montecristo Cigar Bar — opened 2023 at Paris Las Vegas. Premium humidor; cocktail program.', now()),
  ('vegas-lovo-cigars-fremont', 'Lovo Cigars', 'Las Vegas', 'United States', '510 Fremont Street, Las Vegas, NV 89101', 36.1697, -115.1411, 'retailer', NULL, 'Family-run Fremont Street cigar shop downtown — the closest indoor smoking spot to the Fremont Experience.', now()),

  -- ── Los Angeles / Beverly Hills / Hollywood ──────────────────
  ('la-cigar-warehouse-sherman-oaks', 'The Cigar Warehouse', 'Sherman Oaks', 'United States', '15141 Ventura Boulevard, Sherman Oaks, CA 91403', 34.1551, -118.4659, 'retailer', 'https://www.cigarwarehouse.com/', 'Ventura Blvd flagship — one of the largest walk-in humidors on the West Coast. Indoor lounge; cigar-of-the-month club.', now()),
  ('la-maybourne-cigar-whiskey-bar', 'The Cigar & Whiskey Bar at The Maybourne Beverly Hills', 'Beverly Hills', 'United States', '225 North Canon Drive, Beverly Hills, CA 90210', 34.0710, -118.4014, 'lounge', 'https://www.maybournebeverlyhills.com/', 'Maybourne Hotel''s cigar lounge — rare single malts, custom humidor, indoor seating. Open 5pm-midnight.', now()),
  ('la-grand-havana-room-beverly-hills', 'Grand Havana Room Beverly Hills', 'Beverly Hills', 'United States', '301 North Canon Drive, Beverly Hills, CA 90210', 34.0703, -118.4015, 'club', 'https://grandhavana.com/beverly-hills/', 'Flagship private cigar club since April 1995. Restaurant on Canon Drive with private elevator to the club; rooftop terrace.', now()),

  -- ── Washington DC ────────────────────────────────────────────
  ('dc-w-curtis-draper', 'W. Curtis Draper Tobacconist', 'Washington', 'United States', '4916 Del Ray Avenue, Bethesda, MD 20814', 38.9847, -77.0947, 'retailer', 'https://wcurtisdraper.com/', 'The District''s oldest full-service tobacconist (1887), now operating from Bethesda after the 15th Street closure. Walk-in humidor.', now()),

  -- ── Atlanta ──────────────────────────────────────────────────
  ('atlanta-davidoff-buckhead', 'Davidoff of Geneva · Atlanta', 'Atlanta', 'United States', '5006 Roswell Road, Atlanta, GA 30342', 33.8826, -84.3784, 'house', 'https://us.davidoffgeneva.com/', 'Davidoff''s Buckhead flagship. Walk-in humidor; smoking lounge.', now()),

  -- ── Houston / Dallas ─────────────────────────────────────────
  ('houston-stogies-on-fairview', 'Stogies World Class Cigars', 'Houston', 'United States', '5701 Memorial Drive, Houston, TX 77007', 29.7613, -95.4185, 'lounge', 'https://stogiesworldclasscigars.com/', 'Memorial-area cigar lounge — walk-in humidor and ventilated indoor lounge with full bar.', now()),
  ('philadelphia-holts-walnut', 'Holt''s Cigar Company', 'Philadelphia', 'United States', '1522 Walnut Street, Philadelphia, PA 19102', 39.9498, -75.1681, 'retailer', 'https://www.holts.com/', 'Family-run since 1898. The Ashton-Fuente-Padron flagship retailer; one of the largest humidified warehouses in the US.', now())
ON CONFLICT (slug) DO NOTHING;


-- ──────────────────────────────────────────────────────────────────────────
-- Section 2: United Kingdom (London depth)
-- ──────────────────────────────────────────────────────────────────────────

INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  ('london-connaught-cigar-merchants', 'The Connaught Cigar Merchants', 'London', 'United Kingdom', 'Carlos Place, Mayfair, London W1K 2AL', 51.5101, -0.1500, 'lounge', 'https://www.the-connaught.co.uk/restaurants-bars/the-connaught-cigar-merchants/', 'Speakeasy-style cigar room off The Connaught''s Red Room. Italian wall-length humidor; Cohiba Siglo VI Gran Reserva, Montecristo Sublimes. Head of Cigars Adam Lajca is a Master of Havana. Mon-Sat 4pm-1am.', now()),
  ('london-ritz-cigar-lounge', 'The Ritz London Cigar Lounge', 'London', 'United Kingdom', '150 Piccadilly, London W1J 9BR', 51.5071, -0.1419, 'lounge', 'https://www.theritzlondon.com/ritzlondoncigars/', 'Ground-floor sampling lounge next to the Rivoli Bar. Hand-crafted walk-in humidor; own-label Ritz London cigars (1906 Laguito, Churchill). Daily 11am-8pm; smart casual.', now()),
  ('london-wellesley-cigar-terrace', 'The Wellesley Cigar Terrace', 'London', 'United Kingdom', '11 Knightsbridge, London SW1X 7LY', 51.5025, -0.1530, 'lounge', 'https://www.marriott.com/en-gb/hotels/lonwb-the-wellesley-knightsbridge-a-luxury-collection-hotel-london/', 'UK''s largest hotel humidor — said to hold $2M of Habanos. Heated, fully glazed cigar terraces flanking the entrance; vintage Cuban cabinet.', now()),
  ('london-beaumont-magritte-terrace', 'Le Magritte Bar & Terrace at The Beaumont', 'London', 'United Kingdom', '8 Balderton Street, Mayfair, London W1K 6TF', 51.5128, -0.1530, 'lounge', 'https://www.thebeaumont.com/', 'Mayfair hotel''s cigar terrace overlooking Brown Hart Gardens. Custom DeART walk-in humidor; full Cuban range incl. ELs and Regionals; private lockers.', now()),
  ('london-davidoff-burlington-arcade', 'Davidoff of Mayfair', 'London', 'United Kingdom', '2-3 Burlington Arcade, London W1J 0PJ', 51.5089, -0.1397, 'retailer', 'https://www.davidofflondon.com/', 'Davidoff''s Burlington Arcade boutique. Walk-in humidor; appointments for private tastings.', now()),
  ('london-jjfox-selfridges', 'James J. Fox at Selfridges', 'London', 'United Kingdom', '400 Oxford Street, London W1A 1AB', 51.5145, -0.1525, 'retailer', 'https://www.jjfox.co.uk/selfridges', 'JJ Fox''s outlet inside Selfridges, lower ground floor next to Gordon''s Wine Bar. Cuban + New World; bespoke Matthew Mason humidors. Retail only.', now()),
  ('london-arts-club-oscuro', 'Oscuro at The Arts Club', 'London', 'United Kingdom', '40 Dover Street, Mayfair, London W1S 4NP', 51.5093, -0.1421, 'club', 'https://www.theartsclub.co.uk/food-drink/oscuro/', 'Members-only Mayfair Arts Club basement cigar lounge. Walk-in humidor; full cocktail program; dress code enforced.', now()),
  ('london-quaglinos', 'Quaglino''s Q Bar Cigar Lounge', 'London', 'United Kingdom', '16 Bury Street, St James''s, London SW1Y 6AJ', 51.5081, -0.1377, 'lounge', 'https://www.quaglinos-restaurant.co.uk/', 'St James''s restaurant with a heated cigar terrace and walk-in humidor. Cuban + New World; minimum spend for non-diners.', now())
ON CONFLICT (slug) DO NOTHING;


-- ──────────────────────────────────────────────────────────────────────────
-- Section 3: Europe flagship cities
-- ──────────────────────────────────────────────────────────────────────────

INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- ── Geneva / Zurich / Basel ──────────────────────────────────
  ('geneva-house-of-grauer', 'The House of Grauer', 'Geneva', 'Switzerland', 'Cours de Rive 9, 1204 Genève', 46.2020, 6.1488, 'lounge', 'https://www.houseofgrauer.com/', '6,000+ sq ft Geneva temple — Europe''s largest walk-in humidor (500K+ cigars), cigar museum, private lounge, wine and spirits room. Annual locker ~CHF 800.', now()),
  ('geneva-rhein-1905', 'Rhein 1905 (Tabac Rhein)', 'Geneva', 'Switzerland', 'Rue Pierre-Fatio 12, 1204 Genève', 46.2014, 6.1500, 'retailer', 'https://www.rheincigars.ch/', 'Trading since 1905 in central Geneva. Walk-in humidor; deep Cuban cabinet including ELs and Regionals.', now()),
  ('geneva-lvx-cigars', 'LVX Geneva Cigars', 'Geneva', 'Switzerland', 'Rue du Mont-Blanc 17, 1201 Genève', 46.2089, 6.1453, 'retailer', 'https://www.lvxgenevacigars.ch/', 'Boutique Geneva tobacconist near the lake. Cigars, accessories and rare spirits.', now()),
  ('geneva-cigar-market', 'The Cigar Market', 'Geneva', 'Switzerland', 'Rue du Rhône 100, 1204 Genève', 46.2018, 6.1493, 'retailer', 'https://thecigarmarket.ch/', 'Specialist Cuban-cigar retailer on Rue du Rhône. Walk-in humidor.', now()),

  -- ── Hamburg / Frankfurt / Munich / Berlin ────────────────────
  ('hamburg-pfeifen-tesch', 'Pfeifen Tesch', 'Hamburg', 'Germany', 'Colonnaden 5, 20354 Hamburg', 53.5577, 9.9889, 'retailer', 'https://www.pfeifen-tesch.de/', 'Hamburg tobacconist on the Colonnaden trading since 1880. Walk-in humidor; pipes and cigars.', now()),
  ('hamburg-pfeifendepot-gerd-jansen', 'Gerd Jansens Pfeifendepot', 'Hamburg', 'Germany', 'Heidenkampsweg 99, 20097 Hamburg', 53.5443, 10.0307, 'retailer', 'https://pfeifendepot.de/', 'Finest Tobacco since 1899 — speakeasy-style sampling space, tobaccos and spirits.', now()),
  ('hamburg-john-aylesbury-hauptbahnhof', 'John Aylesbury Hamburg', 'Hamburg', 'Germany', 'Mönckebergstraße 7, 20095 Hamburg', 53.5510, 10.0008, 'retailer', 'https://www.john-aylesbury.de/', 'Mönckebergstraße flagship of the John Aylesbury group — Habanos Specialist; walk-in humidor.', now()),
  ('frankfurt-john-aylesbury', 'John Aylesbury Frankfurt', 'Frankfurt', 'Germany', 'Goethestraße 14, 60313 Frankfurt am Main', 50.1145, 8.6791, 'retailer', 'https://www.john-aylesbury.de/', 'Frankfurt outpost of the John Aylesbury cigar group on the Goethestraße luxury mile.', now()),
  ('munich-pulvermacher', 'Pulvermacher Tabakhaus', 'Munich', 'Germany', 'Briennerstraße 11, 80333 München', 48.1419, 11.5760, 'retailer', 'https://www.pulvermacher.de/', 'Munich tobacconist since 1894 near Odeonsplatz. Walk-in humidor; Habanos and Davidoff.', now()),
  ('berlin-pfeifen-timm', 'Pfeifen Timm', 'Berlin', 'Germany', 'Uhlandstraße 28, 10719 Berlin', 52.5005, 13.3257, 'retailer', 'https://www.pfeifen-timm.de/', 'Charlottenburg tobacconist near Kurfürstendamm; pipes and cigars.', now()),

  -- ── Madrid / Barcelona ───────────────────────────────────────
  ('madrid-tabacos-vega', 'Tabacos Vega', 'Madrid', 'Spain', 'Calle Goya 13, 28001 Madrid', 40.4250, -3.6862, 'retailer', 'https://www.tabacosvega.com/', 'Salamanca district Habanos Specialist with walk-in humidor. Cuban + Dominican depth.', now()),
  ('madrid-davidoff-serrano', 'Davidoff Madrid', 'Madrid', 'Spain', 'Calle de Serrano 38, 28001 Madrid', 40.4242, -3.6878, 'house', 'https://www.davidoff.com/', 'Davidoff Madrid flagship in Barrio Salamanca. Walk-in humidor; appointments.', now()),
  ('barcelona-coronas', 'Coronas Cigars', 'Barcelona', 'Spain', 'Rambla de Catalunya 19, 08007 Barcelona', 41.3879, 2.1668, 'retailer', NULL, 'Eixample-district Habanos Specialist on Rambla de Catalunya. Walk-in humidor.', now()),
  ('barcelona-estanco-duque-medinaceli', 'Estanco Duque de Medinaceli', 'Barcelona', 'Spain', 'Carrer Ample 1, 08002 Barcelona', 41.3801, 2.1773, 'retailer', NULL, 'Gothic Quarter historic estanco; Cuban depth and a small humidor cabinet.', now()),

  -- ── Paris ────────────────────────────────────────────────────
  ('paris-plaza-athenee-bar', 'Plaza Athénée Bar Humidor', 'Paris', 'France', '25 Avenue Montaigne, 75008 Paris', 48.8657, 2.3038, 'lounge', 'https://www.dorchestercollection.com/en/paris/hotel-plaza-athenee/', 'Hotel Plaza Athénée''s walk-in humidor and bar — Cuban + Davidoff Dominican range. Smoking permitted in designated areas only.', now()),
  ('paris-george-v-cigar-area', 'Le Bar at Four Seasons George V', 'Paris', 'France', '31 Avenue George V, 75008 Paris', 48.8688, 2.3008, 'lounge', 'https://www.fourseasons.com/paris/', 'George V''s cigar-friendly outdoor bar area; reservations required. Cuban humidor.', now()),
  ('paris-la-reserve-cigar-lounge', 'La Réserve Paris Cigar Lounge', 'Paris', 'France', '42 Avenue Gabriel, 75008 Paris', 48.8696, 2.3134, 'lounge', 'https://www.lareserve-paris.com/', 'Champs-Élysées palace hotel with a discreet cigar lounge and curated humidor.', now()),
  ('paris-175-cigar-lounge', '175 Paris Cigar Lounge', 'Paris', 'France', '175 Boulevard Pereire, 75017 Paris', 48.8807, 2.2911, 'lounge', 'https://175paris.com/', '17th-arr cigar club and lounge with retail humidor; events and members'' nights.', now()),

  -- ── Milan / Rome / Florence ──────────────────────────────────
  ('milan-bulgari-hotel-lounge', 'The Lounge at Bulgari Hotel Milano', 'Milan', 'Italy', 'Via Privata Fratelli Gabba 7b, 20121 Milano', 45.4710, 9.1873, 'lounge', 'https://www.bulgarihotels.com/milan/', 'Bulgari Milan''s garden-side lounge; cigar-friendly terrace and curated humidor selection.', now()),
  ('milan-pipe-castello', 'Pipe Castello', 'Milan', 'Italy', 'Foro Buonaparte 67, 20121 Milano', 45.4707, 9.1813, 'retailer', NULL, 'Milan tobacconist near the Castello Sforzesco; pipes and cigars with deep Habanos cabinet.', now()),
  ('rome-hotel-de-ricci-cigar-lounge', 'Cigar Lounge at Hotel De'' Ricci', 'Rome', 'Italy', 'Via della Posta Vecchia 3, 00186 Roma', 41.8989, 12.4707, 'lounge', 'https://www.hoteldericci.com/en/cigar-lounge/', 'Speakeasy-style cigar lounge in the heart of Rome''s Centro Storico. Italian Toscano selection plus Cuban cabinet.', now()),
  ('rome-tabaccheria-becker-musico', 'Becker & Musicò', 'Rome', 'Italy', 'Via dei Liguri 8, 00185 Roma', 41.8943, 12.5132, 'retailer', NULL, 'San Lorenzo district tobacconist; Habanos Specialist with broad Italian Toscano range.', now()),
  ('florence-tabaccheria-sotto-portici', 'Tabaccheria Sotto i Portici', 'Florence', 'Italy', 'Piazza della Repubblica 6/r, 50123 Firenze', 43.7714, 11.2538, 'retailer', NULL, 'Florence tobacconist under the arcades of Piazza della Repubblica. Walk-in humidor; Toscanos and Habanos.', now()),

  -- ── Vienna ───────────────────────────────────────────────────
  ('vienna-opera-trafik-cigar-lounge', 'Opera Trafik & Cigar Lounge', 'Vienna', 'Austria', 'Kärntner Ring 6, 1010 Wien', 48.2032, 16.3697, 'lounge', 'https://operatrafik.com/', 'Cigar lounge opposite the Vienna State Opera. Walk-in humidor; ventilated indoor smoking.', now()),
  ('vienna-schober-pfeifenstudio', 'Tabak-Fachgeschäft Thomas Schober (Cigarren- & Pfeifenstudio)', 'Vienna', 'Austria', 'Lerchenfelder Straße 78-80, 1080 Wien', 48.2106, 16.3441, 'retailer', NULL, 'Renowned Josefstadt tobacconist; walk-in humidor with Habanos and German pipes.', now()),
  ('vienna-tabak-trafik-maria-singer', 'Tabak Trafik Maria Singer', 'Vienna', 'Austria', 'Salztorgasse 2, 1010 Wien', 48.2129, 16.3722, 'retailer', NULL, 'Innere Stadt Habanos-stocking trafik a short walk from Schwedenplatz.', now()),

  -- ── Amsterdam ────────────────────────────────────────────────
  ('amsterdam-lcdh-conservatorium', 'La Casa del Habano Amsterdam (Conservatorium Hotel)', 'Amsterdam', 'Netherlands', 'Van Baerlestraat 27, 1071 AN Amsterdam', 52.3563, 4.8810, 'casadelhabano', 'https://www.conservatoriumhotel.com/', 'LCDH Amsterdam inside the Mandarin Oriental Conservatorium. Piano-converted humidor; sampling lounge for 10-12; member events. Opened 2012.', now()),
  ('amsterdam-hotel-de-leurope-cigar', 'Hotel De L''Europe Cigar Lounge', 'Amsterdam', 'Netherlands', 'Nieuwe Doelenstraat 2-14, 1012 CP Amsterdam', 52.3690, 4.8943, 'lounge', 'https://www.deleurope.com/', 'Amsterdam''s oldest five-star hotel; cigar lounge and Amstel-side riverside terrace.', now()),

  -- ── Brussels / Antwerp ───────────────────────────────────────
  ('brussels-le-roi-du-cigare', 'Le Roi du Cigare', 'Brussels', 'Belgium', 'Rue Royale 25, 1000 Bruxelles', 50.8475, 4.3636, 'retailer', 'https://leroiducigare.com/', 'Habanos Specialist on Rue Royale, established 1948; Philippe Vanderbruggen (4th generation) since 2003. Walk-in humidor.', now()),
  ('brussels-la-tete-dor', 'La Tête d''Or', 'Brussels', 'Belgium', 'Rue de la Tête d''Or 8, 1000 Bruxelles', 50.8472, 4.3522, 'retailer', NULL, 'Grand-Place adjacent Habanos Specialist; the central Brussels cigar boutique.', now()),
  ('brussels-cig-art', 'Cig-Art Brussels', 'Brussels', 'Belgium', 'Avenue Louise 251, 1050 Bruxelles', 50.8253, 4.3735, 'retailer', NULL, 'Avenue Louise cigar boutique on Brussels'' luxury mile.', now())
ON CONFLICT (slug) DO NOTHING;
