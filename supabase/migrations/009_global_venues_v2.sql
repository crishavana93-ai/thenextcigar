-- ============================================================================
-- The Lounge — global venues v2 (migration 009)
-- ============================================================================
-- Deep-dive supplement adding Havana, UK, US, and Europe venues missed in
-- earlier passes. Aims for comprehensive coverage of major cigar cities
-- worldwide so 'find places near me' returns useful results everywhere a
-- member is likely to travel.
--
-- Sources cross-checked:
--   - Habanos S.A. official locator (habanos.com/place/...)
--   - La Casa del Habano locator (lacasadelhabano.com)
--   - Hunters & Frankau UK retailer directory (cigars.co.uk)
--   - Cigar Aficionado venue features (Lanesborough, Hotel Nacional, etc.)
--   - Cigar Journal regional features
--   - London Cigar Smoker venue write-ups (2023–2025)
--   - Google Maps coordinates (lat/lng to 4 decimal places)
--   - Yelp / Tripadvisor 2025–2026 status checks
--
-- Conventions match migrations 005 and 008:
--   - verified_at = now() so venues appear immediately
--   - permanently-closed venues OMITTED:
--       * Casa Fuente Las Vegas (Forum Shops, closed 19 Oct 2025)
--       * Hotel Saratoga Havana (still closed after 2022 gas-explosion)
--       * Merchants Cigar Bar NYC (1st Ave — closed again 2025)
--       * Lexington Bar & Books NYC (closed)
--       * Velvet Cigar Lounge NYC (closed)
--       * Mayan Imports French Quarter (closed; Garden District location open)
--       * UpTown's Smoke Shop Nashville (rebranded as Nashville Cigar)
--       * Prince Philip's Pipes & Tobacco Denver (closed)
--       * Stag Tobacconist Phoenix N. 29th Ave (closed; Scottsdale open)
--   - ON CONFLICT (slug) DO NOTHING — safe to re-run
--   - Slugs are stable, kebab-case, globally unique, city-prefixed where
--     useful to avoid collisions with existing migrations
--   - Perks text is honest descriptors, NOT marketing copy
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- HAVANA — the mecca
-- ────────────────────────────────────────────────────────────────────────────
-- Most of these are hotel humidors operated by Habanos S.A. through state
-- tourism vehicles (Cubanacán, Gran Caribe, Habaguanex), plus a couple of
-- factory shops and Hemingway-era bars that have become cigar pilgrimage
-- sites. Categorized realistically — most are 'retailer' (hotel shop with
-- humidor) or 'house' (proper lounges).
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- The 8th Casa del Habano in Havana — Quinta Avenida (Miramar). Widely
  -- considered Cuba's finest LCDH; full-service restaurant and 96 lockers.
  ('lcdh-havana-quinta-avenida', 'La Casa del Habano · 5ta y 16', 'Havana', 'Cuba', '5ta Avenida esq. Calle 16, Miramar, Playa, La Habana 10400', 23.1237, -82.4184, 'casadelhabano', 'https://lacasadelhabano.com/', 'Many consider this the finest LCDH in Cuba. Full-service restaurant; 96 personal lockers — the most of any LCDH in Havana. Run by Carlos Robaina.', now()),

  -- Cohiba Atmosphere Havana — flagship cigar lounge inside Gran Hotel
  -- Manzana Kempinski. Walk-in humidor + private rooms; all stick prices.
  ('havana-cohiba-atmosphere-kempinski', 'Cohiba Atmosphere Havana', 'Havana', 'Cuba', 'Manzana de Gómez, Calle San Rafael, La Habana Vieja 10100', 23.1376, -82.3585, 'house', 'https://www.habanos.com/', 'Flagship Cohiba Atmosphere lounge inside Gran Hotel Manzana Kempinski. Walk-in humidor, private meeting rooms, all areas smoking-permitted. Prices are by the stick.', now()),

  -- Hotel Nacional smoking lounge — separate from the LCDH downstairs.
  -- Note: the downstairs LCDH is already in our DB under the (mislabeled)
  -- slug 'lcdh-hostal-conde-de-villanueva'. This is the upstairs lounge.
  ('havana-hotel-nacional-lounge', 'Hotel Nacional Cigar Lounge', 'Havana', 'Cuba', 'Calle 21 y O, Vedado, La Habana 10400', 23.1444, -82.3838, 'lounge', 'https://hotelnacionaldecuba.com/', 'Hidden upstairs cigar lounge opened 2022; separate from the ground-floor LCDH. Outdoor terrace overlooking the Malecón.', now()),

  -- El Floridita — Hemingway's daiquiri bar, still smokes-friendly with
  -- a small humidor at the back.
  ('havana-el-floridita', 'El Floridita', 'Havana', 'Cuba', 'Obispo 557 esq. Monserrate, La Habana Vieja 10100', 23.1370, -82.3580, 'pub', 'https://www.barfloridita.com/', 'Hemingway''s original Havana haunt. Bar humidor; smoke a Cohiba at the counter while the quartet plays. Touristy but historically essential.', now()),

  -- Hotel Inglaterra cigar shop — one of Centro Habana's oldest hotels,
  -- with a proper tobacco/coffee/rum shop and smokers' bar on the ground
  -- floor. Re-opened after renovation.
  ('havana-hotel-inglaterra-cigar-shop', 'Hotel Inglaterra Cigar Shop', 'Havana', 'Cuba', 'Paseo del Prado 416 e/ San Rafael y Neptuno, La Habana Vieja 10100', 23.1366, -82.3589, 'retailer', 'https://hotelinglaterralahabana.com/', 'Walk-in humidor and small smokers'' bar on the ground floor of Cuba''s oldest hotel (1875). Habanos S.A. operated.', now()),

  -- Iberostar Parque Central — Alameda Cigar Bar (NOT an LCDH).
  ('havana-iberostar-alameda-cigar-bar', 'Alameda Cigar Bar (Iberostar Parque Central)', 'Havana', 'Cuba', 'Calle Neptuno e/ Prado y Zulueta, La Habana Vieja 10100', 23.1377, -82.3580, 'lounge', 'https://www.ibercuba.com/en/hotels/la-habana/iberostar-parque-central/', 'Cigar bar and adjoining humidor shop inside the 5-star Iberostar Parque Central. Open late; aged rum pairings.', now()),

  -- Hotel Sevilla — Spanish-Moorish landmark, ground-floor patio bar
  -- with a Habanos cabinet humidor.
  ('havana-hotel-sevilla-humidor', 'Hotel Sevilla Cigar Humidor', 'Havana', 'Cuba', 'Calle Trocadero 55 e/ Prado y Zulueta, La Habana Vieja 10100', 23.1390, -82.3590, 'retailer', 'https://www.iberostar.com/', 'Habanos cabinet humidor in the patio bar of the 1908 Hotel Sevilla. Smaller selection than the LCDHs but cigar service in the courtyard.', now()),

  -- Hotel Ambos Mundos — Hemingway slept here. Rooftop bar; cigars
  -- sold at the lobby tobacco counter.
  ('havana-hotel-ambos-mundos', 'Hotel Ambos Mundos Tobacco Counter', 'Havana', 'Cuba', 'Calle Obispo 153 esq. Mercaderes, La Habana Vieja 10100', 23.1411, -82.3537, 'retailer', NULL, 'Lobby tobacco counter and rooftop bar of Hemingway''s 1932 hotel. Modest humidor; the appeal is the room and rooftop view.', now()),

  -- Hotel Habana Riviera (Origin / former Iberostar) — Vedado Malecón
  -- landmark. Ground-floor humidor.
  ('havana-hotel-riviera-humidor', 'Hotel Habana Riviera Cigar Shop', 'Havana', 'Cuba', 'Paseo y Malecón, Vedado, La Habana 10400', 23.1455, -82.3893, 'retailer', NULL, 'Original 1957 Meyer Lansky hotel; modest lobby humidor with Habanos S.A. selection. Atmosphere is the draw, not depth.', now()),

  -- Casa del Tabaco "La Escogida" — Hotel Comodoro Miramar.
  -- NOT an LCDH but a serious Habanos shop run by Habanos S.A.
  ('havana-comodoro-casa-tabaco-escogida', 'Casa del Tabaco · La Escogida (Hotel Comodoro)', 'Havana', 'Cuba', '3ra y Calle 84, Miramar, Playa, La Habana 11300', 23.1135, -82.4503, 'retailer', NULL, 'Habanos S.A. tobacco shop at the Hotel Comodoro in Miramar. Separate entrance from the hotel; welcoming if weathered.', now()),

  -- Real Fábrica de Tabacos H. Upmann — operational factory + sales
  -- room with a cigar bar. Padre Varela (Belascoaín) location.
  ('havana-fabrica-h-upmann', 'Fábrica H. Upmann', 'Havana', 'Cuba', 'Calle Padre Varela 852, Centro Habana 10200', 23.1356, -82.3717, 'retailer', NULL, 'Operational H. Upmann / Montecristo / Cohiba factory. Sales room and bar; tours bookable through Tabacuba.', now()),

  -- Fábrica de Tabacos Francisco Donatién (Pinar del Río) — converted
  -- 19th-century prison; produces Trinidad and Vegueros. Sales room.
  ('pinar-del-rio-francisco-donatien', 'Fábrica de Tabacos Francisco Donatién', 'Pinar del Río', 'Cuba', 'Calle Antonio Maceo 157, Pinar del Río 20100', 22.4180, -83.6970, 'retailer', NULL, 'Working factory in a converted 1860s prison. Produces Trinidad and Vegueros. Tours every hour 8:00–13:00; sales room and Casa del Tabaco across the street.', now()),

  -- Casa del Veguero — tobacco farm in Viñales valley with secadero
  -- (drying house), cigar tastings on a working farm.
  ('vinales-casa-del-veguero', 'Casa del Veguero', 'Viñales', 'Cuba', 'Carretera de Pinar del Río km 26, Viñales 22400', 22.6094, -83.7222, 'house', NULL, 'Working tobacco farm with secadero on the Viñales–Pinar del Río road. Tour the drying house, then a farm-rolled cigar and coffee.', now()),

  -- Sloppy Joe's Bar — reopened 2013 after a 48-year closure. Sells
  -- cigars over the bar; not a serious humidor but a tourist staple.
  ('havana-sloppy-joes', 'Sloppy Joe''s Bar Havana', 'Havana', 'Cuba', 'Calle Zulueta 252 esq. Animas y Virtudes, La Habana Vieja 10100', 23.1397, -82.3597, 'pub', NULL, 'Historic 1917 American bar; reopened 2013. Modest cigar service at the 60ft mahogany bar — the room and the cocktails are the draw.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- UNITED KINGDOM
-- ────────────────────────────────────────────────────────────────────────────
-- London depth (Mayfair members clubs with serious cigar programmes) plus
-- the major regional Habanos Specialists outside London: Manchester,
-- Liverpool, Edinburgh, Glasgow, Belfast, Birmingham, Cardiff, Leicester.
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Mark's Club (a Birley club) — top-floor cigar keeps room with 70
  -- lockers; first-floor terrace is now the cigar epicentre.
  ('london-marks-club', 'Mark''s Club', 'London', 'United Kingdom', '46 Charles Street, Mayfair, London W1J 5EJ', 51.5074, -0.1486, 'club', 'https://marksclub.co.uk/', 'Members-only Birley club. Cigar keeps room on the top floor (70 lockers); cigar terrace on the first floor. Master of Cigars on site.', now()),

  -- 5 Hertford Street (Loulou's) — cigar courtyard + Birley Cigar Shop.
  ('london-5-hertford-street', '5 Hertford Street', 'London', 'United Kingdom', '5 Hertford Street, Mayfair, London W1J 7RQ', 51.5074, -0.1483, 'club', 'https://www.5hertfordstreet.com/', 'Robin Birley''s members club off Shepherd Market. Cigar courtyard, roof terrace and the Birley Cigar Shop on site.', now()),

  -- Annabel's — 26,000 sq ft over a Berkeley Square townhouse; cigar
  -- salon (Humidor room) and Garden Room terrace with retractable roof.
  ('london-annabels', 'Annabel''s', 'London', 'United Kingdom', '46 Berkeley Square, Mayfair, London W1J 5AT', 51.5097, -0.1466, 'club', 'https://annabels.co.uk/', 'Members-only; dedicated Humidor cigar salon with Hogarth chairs, plus the Garden Room courtyard with fig trees and a retractable roof.', now()),

  -- The Garden Room at The Lanesborough Hotel — one of London's most
  -- celebrated walk-in humidors. Two humidors, 150+ cigars.
  ('london-lanesborough-garden-room', 'The Garden Room at The Lanesborough', 'London', 'United Kingdom', 'Hyde Park Corner, London SW1X 7TA', 51.5026, -0.1521, 'lounge', 'https://www.oetkerhotels.com/hotels/the-lanesborough/', 'Open to non-members. Two Massimo de Munari handmade humidors; 150+ Habanos including vintage Behikes. Outdoor terrace; minimum spend.', now()),

  -- No. Ten Manchester Street Hotel — Marylebone boutique hotel with
  -- a dedicated cigar terrace (all-weather) and walk-in humidor.
  ('london-no-ten-manchester-street', 'Cigars at No. Ten Manchester Street', 'London', 'United Kingdom', '10 Manchester Street, Marylebone, London W1U 4DG', 51.5180, -0.1518, 'lounge', 'https://www.tenmanchesterstreethotel.com/cigars/', 'All-weather cigar terrace and indoor sampling lounge with bespoke De Art walk-in humidor. £35 minimum spend for non-residents.', now()),

  -- Luis Fernando Habanos — independent Habanos Specialist in Stoke
  -- Newington (north London), unusual for being outside Mayfair.
  ('london-luis-fernando-habanos', 'Luis Fernando Habanos', 'London', 'United Kingdom', '79 Stoke Newington Church Street, London N16 0AS', 51.5615, -0.0790, 'retailer', NULL, 'North London Habanos Specialist; broad Cuban range in a residential setting away from the Mayfair circuit.', now()),

  -- Manchester — Aston's of Manchester (in the Royal Exchange) + the
  -- Dakota Hotel cigar terrace.
  ('manchester-astons', 'Aston''s of Manchester', 'Manchester', 'United Kingdom', '12 Royal Exchange Arcade, Manchester M2 7EA', 53.4818, -2.2440, 'retailer', 'https://astonsofmanchester.co.uk/', 'Established 1978; first walk-in humidor outside London. Habanos Specialist. Inside the Royal Exchange Arcade.', now()),

  ('manchester-dakota-cigar-terrace', 'Dakota Hotel Manchester · Cigar Terrace', 'Manchester', 'United Kingdom', '29 Ducie Street, Manchester M1 2JL', 53.4790, -2.2334, 'lounge', 'https://dakotahotels.co.uk/manchester/', 'Purpose-built cigar terrace (16 seats) and bar humidor next to the Champagne Room. Reservations required.', now()),

  -- Liverpool — Puffin' Rooms cigar lounge (Old Hall Street, 2017).
  ('liverpool-puffin-rooms', 'Puffin'' Rooms Liverpool', 'Liverpool', 'United Kingdom', '8 Old Hall Street, Liverpool L3 9PA', 53.4093, -2.9920, 'lounge', 'https://www.puffinrooms.co.uk/', 'Luxury cocktail bar with dedicated cigar lounge; 200+ whiskies by the dram. Sister venue to the Edinburgh Puffin'' Rooms.', now()),

  -- Edinburgh — Robert Graham 1874 flagship on Rose Street.
  ('edinburgh-robert-graham-rose-street', 'Robert Graham 1874 Edinburgh', 'Edinburgh', 'United Kingdom', '194 Rose Street, Edinburgh EH2 4AZ', 55.9533, -3.2058, 'retailer', 'https://robertgraham1874.com/', 'Habanos Specialist; one of Scotland''s oldest whisky and cigar houses (1874). Walk-in humidor in the centre of New Town.', now()),

  -- Glasgow — Robert Graham 1874 on West George Street. Scotland's
  -- largest walk-in humidor per the company itself.
  ('glasgow-robert-graham', 'Robert Graham 1874 Glasgow', 'Glasgow', 'United Kingdom', '111 West George Street, Glasgow G2 1QX', 55.8625, -4.2570, 'retailer', 'https://robertgraham1874.com/', 'Habanos Specialist; the firm''s original 1874 city, with Scotland''s largest walk-in humidor per the house.', now()),

  -- Belfast — Miss Moran's Tobacconist, NI's only Habanos Specialist.
  ('belfast-miss-morans', 'Miss Moran''s Tobacconist', 'Belfast', 'United Kingdom', '6 Church Lane, Belfast BT1 4QN', 54.5994, -5.9275, 'retailer', 'https://missmoran.co.uk/', 'Northern Ireland''s only Habanos Specialist; trading since 1870. A small mahogany-fronted institution off High Street.', now()),

  -- Belfast — The Vineyard (Ormeau Road), Habanos Specialist wine and
  -- cigar merchant.
  ('belfast-vineyard-ormeau', 'The Vineyard Belfast', 'Belfast', 'United Kingdom', '375-377 Ormeau Road, Belfast BT7 3GP', 54.5777, -5.9276, 'retailer', 'https://www.vineyardbelfast.co.uk/', 'Ballynafeigh wine, spirit and cigar merchant; Habanos Specialist with a decent walk-in selection.', now()),

  -- Birmingham — Havana House (John Hollingsworth & Son) in the
  -- Great Western Arcade. Long-standing Habanos retailer.
  ('birmingham-john-hollingsworth-havana-house', 'John Hollingsworth & Son · Havana House', 'Birmingham', 'United Kingdom', '27 Great Western Arcade, Birmingham B2 5HU', 52.4814, -1.8950, 'retailer', 'https://www.havanahouse.co.uk/stores/birmingham/', 'Habanos Specialist inside the Victorian Great Western Arcade. Royal warrant history; walk-in humidor.', now()),

  -- Cardiff — The Bear Shop (Havana House) in the Wyndham Arcade.
  -- Wales' largest tobacconist.
  ('cardiff-bear-shop', 'The Bear Shop · Havana House', 'Cardiff', 'United Kingdom', '12-14 Wyndham Arcade, Cardiff CF10 1FJ', 51.4790, -3.1779, 'retailer', 'https://www.havanahouse.co.uk/stores/the-bear-shop-cardiff/', 'Founded 1870; Wales'' largest tobacconist with a spacious cigar room stocking Limited and Regional Editions.', now()),

  -- Leicester — Cask 23 Cigar Lounge (East Midlands' first proper
  -- sampling lounge).
  ('leicester-cask-23', 'Cask 23 Cigar Lounge', 'Leicester', 'United Kingdom', '64-66 Granby Street, Leicester LE1 1DH', 52.6332, -1.1295, 'lounge', 'https://www.cask23.co.uk/', 'Leicester''s first dedicated cigar sampling lounge. Basement humidor, whisky bar above. Hunters & Frankau partner.', now()),

  -- Chester — La Casa del Habano Chester (Turmeaus-operated). NOT to be
  -- confused with the Chester-prefixed Turmeaus already in DB; this is
  -- the Watergate Street LCDH proper.
  ('lcdh-chester', 'La Casa del Habano Chester', 'Chester', 'United Kingdom', '32 Watergate Street, Chester CH1 2LA', 53.1907, -2.8930, 'casadelhabano', 'https://lcdhchester.com/', 'Watergate Street LCDH; one of the UK''s three Casa del Habano-branded shops alongside Harrods and Teddington.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- UNITED STATES
-- ────────────────────────────────────────────────────────────────────────────
-- Broader US coverage. Excludes Casa Fuente Vegas (closed 19 Oct 2025) and
-- the NYC venues already in 005 (Club Macanudo, Hudson Bar and Books,
-- De La Concha, Carnegie Club, Soho Cigar Bar, Davidoff Madison/6th/etc).
-- Also excludes recently-closed venues (Merchants Cigar Bar, Lexington Bar
-- and Books, Velvet) and venues without a verifiable 2025/2026 status.
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- NYC additions
  ('nyc-cigar-inn-2nd-ave', 'Cigar Inn (2nd Ave)', 'New York', 'United States', '1016 2nd Avenue, New York, NY 10022', 40.7570, -73.9650, 'lounge', NULL, 'Family-run Midtown East cigar lounge. Walk-in humidor and members'' bar; second Cigar Inn after the UES original.', now()),
  ('nyc-cigar-inn-ues', 'Cigar Inn (1st Ave)', 'New York', 'United States', '334 East 73rd Street, New York, NY 10021', 40.7691, -73.9572, 'lounge', NULL, 'The original Upper East Side Cigar Inn on 1st Avenue. Walk-in humidor; lockers.', now()),
  ('nyc-bemelmans-bar-carlyle', 'Bemelmans Bar at The Carlyle', 'New York', 'United States', '35 East 76th Street, New York, NY 10021', 40.7740, -73.9636, 'lounge', 'https://www.rosewoodhotels.com/en/the-carlyle-new-york/dining/bemelmans-bar', 'Iconic 1947 Madeline-muralled cocktail bar. Limited cigar service; the room itself is the cigar history.', now()),
  ('nyc-davidoff-brooklyn', 'Davidoff of Geneva Brooklyn', 'New York', 'United States', '156 Broadway, Brooklyn, NY 11211', 40.7099, -73.9658, 'retailer', 'https://us.davidoffgeneva.com/store/new-york-brooklyn', 'Davidoff''s Williamsburg flagship — next door to Peter Luger. Walk-in humidor and sampling lounge.', now()),
  ('nyc-diamantes-brooklyn', 'Diamante''s Brooklyn Cigar Lounge', 'New York', 'United States', '108 South Oxford Street, Brooklyn, NY 11217', 40.6852, -73.9740, 'lounge', 'https://www.brooklyncigarlounge.com/', 'Fort Greene cigar lounge run by David Diamante (boxing ring announcer). Brooklyn''s longest-running cigar bar.', now()),

  -- Miami additions
  ('miami-casa-de-montecristo-brickell', 'Casa de Montecristo by Prime Cigar & Whiskey Bar', 'Miami', 'United States', '1106 South Miami Avenue, Miami, FL 33130', 25.7647, -80.1947, 'lounge', 'https://www.casademontecristo.com/', 'Brickell flagship — 4,700 sq ft with walk-in humidor, cigar lounge and whisky bar.', now()),
  ('miami-sosa-family-cigars-calle-ocho', 'Sosa Family Cigars · Calle Ocho', 'Miami', 'United States', '3475 SW 8th Street, Miami, FL 33135', 25.7656, -80.2374, 'retailer', NULL, 'Little Havana storefront next to Versailles; the Sosa family''s public-facing shop on Calle Ocho.', now()),
  ('miami-padilla-cigar-co', 'Padilla Cigar Co.', 'Miami', 'United States', '2155 Coral Way, Miami, FL 33145', 25.7503, -80.2178, 'retailer', 'https://www.padillacigars.com/', 'Ernesto Padilla''s flagship — factory and retail outpost on Coral Way.', now()),

  -- Tampa / Ybor City additions
  ('tampa-jc-newman-el-reloj', 'J.C. Newman · El Reloj Factory Store', 'Tampa', 'United States', '2701 North 16th Street, Tampa, FL 33605', 27.9682, -82.4374, 'retailer', 'https://www.jcnewman.com/el-reloj/', 'Last operating cigar factory in Ybor City''s historic district (since 1910). Factory store, museum and Brick Avenue Theatre.', now()),
  ('tampa-sweethearts-cigar-co', 'Tampa Sweethearts Cigar Company', 'Tampa', 'United States', '1601 East 7th Avenue, Tampa, FL 33605', 27.9603, -82.4439, 'retailer', 'https://www.tampasweethearts.com/', 'Arturo Fuente family''s Ybor City casita shop, four generations on. Walk-up sales of Fuente lines, including allocated.', now()),

  -- Chicago — Up Down Cigar in Old Town (Lincoln Park-adjacent).
  ('chicago-up-down-cigar', 'Up Down Cigar', 'Chicago', 'United States', '1550 North Wells Street, Chicago, IL 60610', 41.9089, -87.6346, 'retailer', 'http://www.updowncigar.com/', 'Old Town institution since 1963. Walk-in humidor, heated covered patio for smoking.', now()),

  -- LA / Beverly Hills — Buena Vista Cigar Club.
  ('beverly-hills-buena-vista-cigar-club', 'Buena Vista Cigar Club', 'Beverly Hills', 'United States', '9715 South Santa Monica Boulevard, Beverly Hills, CA 90210', 34.0671, -118.4015, 'club', NULL, 'Members-only and walk-in cigar club on Santa Monica Blvd. Heated patio; cocktail bar.', now()),

  -- Houston additions
  ('houston-briar-shoppe', 'The Briar Shoppe', 'Houston', 'United States', '2412 Times Boulevard, Houston, TX 77005', 29.7193, -95.4138, 'retailer', 'https://briarshoppecigars.com/', 'Rice Village; Houston''s oldest continuously operating tobacconist (1962). Walk-in humidor and pipe range.', now()),
  ('houston-stogies-world-class', 'Stogies World Class Cigars', 'Houston', 'United States', '6100 Westheimer Road, Ste 102, Houston, TX 77057', 29.7372, -95.4910, 'lounge', 'https://stogiesworldclasscigars.com/', 'Galleria-area destination; 24-hour Members Only lounge and a deep premium humidor.', now()),

  -- Dallas additions
  ('dallas-up-in-smoke-preston', 'Up In Smoke North Dallas', 'Dallas', 'United States', '18101 Preston Road, Ste 203, Dallas, TX 75252', 32.9970, -96.8030, 'lounge', 'https://upinsmoke.org/', 'North Dallas cigar lounge open late; bar service and member lockers.', now()),

  -- Phoenix / Scottsdale additions
  ('scottsdale-stag-tobacconist', 'Stag Tobacconist Scottsdale', 'Scottsdale', 'United States', '23535 North Scottsdale Road, Scottsdale, AZ 85255', 33.6885, -111.9244, 'retailer', NULL, 'North Scottsdale Habanos-aware tobacconist; walk-in humidor, smoking lounge.', now()),
  ('scottsdale-fox-cigar-bar', 'Fox Cigar Bar Scottsdale', 'Scottsdale', 'United States', '7443 East 6th Avenue, Scottsdale, AZ 85251', 33.4920, -111.9268, 'lounge', NULL, 'Old Town Scottsdale cigar bar with a deep selection and a smoking patio.', now()),

  -- Seattle
  ('seattle-rain-city-cigar', 'Rain City Cigar', 'Seattle', 'United States', '5963 Corson Avenue South, Ste 130, Seattle, WA 98108', 47.5455, -122.3216, 'retailer', 'https://www.raincitycigar.com/', 'Georgetown cigar shop and lounge since 1997; one of WA''s few proper indoor smoking spaces.', now()),

  -- Denver
  ('denver-churchill-bar-brown-palace', 'Churchill Bar at The Brown Palace', 'Denver', 'United States', '321 17th Street, Denver, CO 80202', 39.7437, -104.9871, 'lounge', 'https://www.brownpalace.com/dining/bars-lounges/churchill-bar/', 'Denver''s iconic full-service cigar lounge inside the 1892 Brown Palace Hotel. 60+ cigars in a custom humidor.', now()),
  ('denver-cigars-on-6th', 'Cigars on 6th', 'Denver', 'United States', '707 East 6th Avenue, Denver, CO 80203', 39.7361, -104.9809, 'retailer', 'https://www.cigarson6th.com/', 'Capitol Hill cigar shop and smoking lounge south of downtown.', now()),
  ('englewood-edwards-pipe-tobacco', 'Edward''s Pipe & Tobacco Shop', 'Englewood', 'United States', '3441 South Broadway, Englewood, CO 80113', 39.6516, -104.9876, 'retailer', 'https://edwardspipeandtobacco.com/', 'Englewood pipe and cigar specialist; Denver metro''s largest walk-in humidor per the house.', now()),

  -- Minneapolis / St Paul
  ('st-paul-stogies-on-grand', 'Stogies on Grand', 'Saint Paul', 'United States', '961 Grand Avenue, Saint Paul, MN 55105', 44.9398, -93.1556, 'retailer', 'http://stogiesongrand.com/', 'Premium tobacconist + lounge serving St Paul since 1998. Diamond Crown lounge; White Label Davidoff dealer.', now()),

  -- Charlotte (Tinder Box — three Charlotte stores, the SouthPark one is
  -- the flagship with the largest humidor)
  ('charlotte-tinder-box-southpark', 'Tinder Box Cigars SouthPark', 'Charlotte', 'United States', '4400 Sharon Road, Ste 226, Charlotte, NC 28211', 35.1530, -80.8284, 'retailer', 'https://tinderboxcigars.com/south-park/', 'Tinder Box''s SouthPark flagship; family-run since 1973. Walk-in humidor and small lounge.', now()),

  -- Nashville
  ('nashville-cigar-green-hills', 'Nashville Cigar (Green Hills)', 'Nashville', 'United States', '4001 Hillsboro Pike, Nashville, TN 37215', 36.1077, -86.8161, 'retailer', 'https://nashvillecigar.co/', 'Formerly UpTown''s Smoke Shop — relaunched as Nashville Cigar in 2025 by the Franklin Cigar team. White Label Davidoff dealer.', now()),

  -- Chattanooga
  ('chattanooga-burns-tobacconist-east', 'Burns Tobacconist East', 'Chattanooga', 'United States', '110 Jordan Drive, Chattanooga, TN 37421', 35.0418, -85.1574, 'retailer', 'https://burnstobacconist.com/', 'Tennessee''s largest walk-in humidor per the house; flagship of the Burns family lounges.', now()),

  -- New Orleans
  ('new-orleans-cigar-factory-decatur', 'Cigar Factory New Orleans', 'New Orleans', 'United States', '415 Decatur Street, New Orleans, LA 70130', 29.9560, -90.0625, 'retailer', 'https://www.cigarfactoryneworleans.com/', 'French Quarter rolling factory (since 1999) with hand-rollers in the front window. Production house cigars on the spot.', now()),
  ('new-orleans-mayan-import-magazine', 'Mayan Import Company · Magazine Street', 'New Orleans', 'United States', '3000 Magazine Street, New Orleans, LA 70115', 29.9286, -90.0794, 'retailer', 'https://mayanimport.com/', 'Garden District cigar shop (their French Quarter location closed 2025; this one remains open). Walk-in humidor and Plasencia-heavy range.', now()),

  -- Philadelphia
  ('philadelphia-holts-cigar-co', 'Holt''s Cigar Co.', 'Philadelphia', 'United States', '1522 Walnut Street, Philadelphia, PA 19102', 39.9495, -75.1668, 'retailer', 'https://www.holts.com/', 'Center City Philadelphia flagship since 1898; walk-in humidor and on-site smoking lounge.', now()),

  -- Pittsburgh / Eastern PA (Cigars International superstores — destinations)
  ('hamburg-pa-ci-superstore', 'Cigars International Superstore Hamburg', 'Hamburg', 'United States', '1635 Mountain Road, Hamburg, PA 19526', 40.5448, -76.0023, 'retailer', 'https://www.cigarsinternational.com/retail/store/ci-hamburg-super-store/9/', 'Cigars International''s original PA superstore; vast walk-in humidor and smoking lounge.', now()),
  ('bethlehem-pa-ci-superstore', 'Cigars International Superstore Bethlehem', 'Bethlehem', 'United States', '4078 Nazareth Pike, Bethlehem, PA 18020', 40.6740, -75.3470, 'retailer', 'https://www.cigarsinternational.com/retail/store/ci-bethlehem-super-store/10/', 'CI''s Lehigh Valley superstore; full lounge and on-site cigar events.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- EUROPE (rest)
-- ────────────────────────────────────────────────────────────────────────────
-- Adds LCDH and Habanos Specialist locations not in 005:
--   Italy (Naples), Switzerland (Lugano, Mendrisio, Montreux, Zug),
--   Belgium (Antwerp), Luxembourg, Austria (Salzburg, Vienna additions),
--   Greece (Athens proper LCDH), Bulgaria (Sofia x3), Romania (Bucharest),
--   Serbia (Belgrade), Croatia (Zagreb, Dubrovnik), Slovenia (Ljubljana),
--   Latvia (Riga), Estonia (Tallinn), Portugal (Porto, Funchal),
--   France (Monaco), Germany (Stuttgart).
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Italy — Naples LCDH (Sisimbro).
  ('lcdh-naples', 'La Casa del Habano Napoli (Sisimbro)', 'Naples', 'Italy', 'Via San Pasquale 74, 80122 Napoli', 40.8336, 14.2360, 'casadelhabano', 'https://sisimbro.it/', 'Naples'' LCDH opened 2020; walk-in humidor and lounge in Chiaia. Operated under the Sisimbro brand.', now()),

  -- Switzerland additions
  ('lcdh-lugano', 'Cigar Must · La Casa del Habano Lugano', 'Lugano', 'Switzerland', 'Via Giuseppe Motta 12, 6900 Lugano', 46.0058, 8.9522, 'casadelhabano', 'https://cigarmust.com/', 'Ticino LCDH (Italian-speaking Switzerland). Walk-in humidor; closed Sundays and Mondays.', now()),
  ('lcdh-mendrisio', 'Cigar Must · La Casa del Habano Mendrisio', 'Mendrisio', 'Switzerland', 'Via Angelo Maspoli 11, 6850 Mendrisio', 45.8693, 8.9810, 'casadelhabano', 'https://cigarmust.com/', 'Cigar Must''s second Ticino LCDH, in the Mendrisio outlet district.', now()),
  ('lcdh-montreux', 'La Casa del Habano Montreux', 'Montreux', 'Switzerland', 'Avenue Claude-Nobs 2, 1820 Montreux', 46.4319, 6.9106, 'casadelhabano', 'https://www.la-casa-del-habano-montreux.com/', 'Lakeside Vaud LCDH next to the Montreux Jazz festival site. Lounge and humidor.', now()),
  ('lcdh-zug', 'La Casa del Habano Zug', 'Zug', 'Switzerland', 'Gotthardstrasse 20, 6300 Zug', 47.1740, 8.5160, 'casadelhabano', 'https://siglomundo.ch/pages/la-casa-del-habano-zug', 'Central-Switzerland LCDH operated by SigloMundo; walk-in humidor and lounge.', now()),

  -- Belgium — Antwerp LCDH (Reza Valibalouch).
  ('lcdh-antwerp', 'La Casa del Habano Antwerp', 'Antwerp', 'Belgium', 'Ernest Van Dijckkaai 11, 2000 Antwerpen', 51.2200, 4.3978, 'casadelhabano', 'https://www.lcdhantwerp.com/', 'Belgium''s first LCDH (2008); 600+ Habanos in a quayside humidor on the Scheldt.', now()),

  -- Luxembourg
  ('lcdh-luxembourg', 'La Casa del Habano Luxembourg', 'Luxembourg', 'Luxembourg', '22B avenue de la Porte-Neuve, L-2227 Luxembourg', 49.6135, 6.1295, 'casadelhabano', 'https://www.lacasadelhabano.lu/', 'Open since 1994 at the same address. Boutique-only sales; no online or international shipping.', now()),

  -- Austria — Salzburg
  ('salzburg-tabak-egger', 'Tabak Egger Salzburg', 'Salzburg', 'Austria', 'Südtiroler Platz 1, 5020 Salzburg', 47.8125, 13.0457, 'retailer', NULL, 'Habanos-stocking tobacconist by the Salzburg main station. Walk-in humidor; Davidoff and NW lines.', now()),

  -- Austria — Vienna addition (Wessely)
  ('vienna-wessely-cigars', 'Wessely Cigars', 'Vienna', 'Austria', 'Weihburggasse 3, 1010 Wien', 48.2080, 16.3724, 'retailer', NULL, 'Innere Stadt tobacconist a block from Stephansplatz. Carries Habanos and Davidoff.', now()),

  -- Greece — Athens LCDH (Nea Erithrea)
  ('lcdh-athens-nea-erithrea', 'La Casa del Habano Athens', 'Athens', 'Greece', 'Kosta Varnali 42, 14671 Nea Erithrea, Athens', 38.0820, 23.8170, 'casadelhabano', 'https://casadelhabanos.gr/', 'Athens'' LCDH in the northern suburb of Nea Erithrea. Walk-in humidor; cigar lounge.', now()),

  -- Bulgaria — Sofia LCDHs (three in the city)
  ('lcdh-sofia-intercontinental', 'La Casa del Habano Sofia · InterContinental', 'Sofia', 'Bulgaria', '4 Narodno Sabranie Square, 1000 Sofia', 42.6940, 23.3320, 'casadelhabano', 'https://www.habanos.com/', 'Ground-floor LCDH of the InterContinental Sofia. Outdoor terrace and walk-in humidor.', now()),
  ('lcdh-sofia-mall', 'La Casa del Habano Sofia · Mall of Sofia', 'Sofia', 'Bulgaria', '101 Aleksandar Stamboliyski Boulevard, 1303 Sofia', 42.6995, 23.3115, 'casadelhabano', 'https://mallofsofia.bg/en/store/la-casa-del-habano/', 'Mall of Sofia LCDH; second of the Sofia franchises.', now()),
  ('sofia-cohiba-atmosphere', 'Cohiba Atmosphere Sofia', 'Sofia', 'Bulgaria', '4 Narodno Sabranie Square, 1000 Sofia', 42.6940, 23.3320, 'house', 'https://www.habanos.com/', 'One of the few Cohiba Atmosphere lounges in Europe. Adjacent to the InterContinental LCDH.', now()),

  -- Romania — Bucharest LCDH
  ('lcdh-bucharest', 'La Casa del Habano Bucharest', 'Bucharest', 'Romania', 'Strada Episcopiei 1-3, Sector 1, 010292 București', 44.4400, 26.0980, 'casadelhabano', 'https://www.habanos.com/', 'Bucharest''s LCDH near Athénée Palace. Cedar walk-in humidor with the full Habanos range.', now()),

  -- Serbia — Belgrade LCDH
  ('lcdh-belgrade', 'La Casa del Habano Belgrade', 'Belgrade', 'Serbia', 'Kneginje Zorke 2, 11000 Beograd', 44.8023, 20.4670, 'casadelhabano', 'https://www.habanos.com/', 'One of the 10 largest walk-in humidors in Europe per the house. Cigar and whisky bar attached.', now()),

  -- Croatia — Dubrovnik LCDH (Havana Cigar Shop)
  ('lcdh-dubrovnik', 'La Casa del Habano Dubrovnik', 'Dubrovnik', 'Croatia', 'Ulica od Puča 1, 20000 Dubrovnik', 42.6403, 18.1097, 'casadelhabano', 'https://habanosmoments.wixsite.com/havana-cigar-shop', 'Inside Dubrovnik''s old town walls. Walk-in humidor; operated by Camelot d.o.o., the regional Habanos importer.', now()),

  -- Croatia — Zagreb Habanos Specialist
  ('zagreb-havana-cigar-shop', 'Havana Cigar Shop Zagreb', 'Zagreb', 'Croatia', 'Radnička cesta 52, 10000 Zagreb', 45.8003, 16.0079, 'retailer', 'https://habanosmoments.wixsite.com/havana-cigar-shop', 'Zagreb Habanos Specialist (Green Gold Club, 2nd floor). Operated by the regional importer Camelot.', now()),

  -- Slovenia — Ljubljana Habanos Specialist
  ('ljubljana-havana-cigar-point', 'Havana Cigar Point Ljubljana', 'Ljubljana', 'Slovenia', 'Trg republike 2, 1000 Ljubljana', 46.0510, 14.5010, 'retailer', NULL, 'Slovenia''s primary Habanos Specialist on Trg republike. Operated by Camelot d.o.o.', now()),

  -- Estonia — Tallinn LCDH (La Casa cigar lounge)
  ('lcdh-tallinn-la-casa', 'La Casa · La Casa del Habano Tallinn', 'Tallinn', 'Estonia', 'Dunkri 5, 10146 Tallinn', 59.4378, 24.7459, 'casadelhabano', 'https://www.habanos.com/', 'Tallinn''s Old Town LCDH and lounge; Afro-Caribbean styled cigar room with Cuban coffee service.', now()),

  -- Latvia — Riga LCDH (Rasa Trading Company)
  ('lcdh-riga', 'La Casa del Habano Riga', 'Riga', 'Latvia', 'Šķūņu iela 19, LV-1050 Rīga', 56.9498, 24.1063, 'casadelhabano', 'https://www.habanos.com/', 'Riga''s Old Town LCDH. Walk-in humidor with the full Habanos range; operated by Rasa Trading Company.', now()),

  -- Portugal — Porto LCDH
  ('lcdh-porto', 'La Casa del Habano Porto', 'Porto', 'Portugal', 'Rua Heróis e Mártires de Angola, Loja 81, 4000-285 Porto', 41.1495, -8.6105, 'casadelhabano', 'https://lacasadelhabano.com/', 'Porto''s LCDH in the Trindade Domus building, central Porto. Walk-in humidor and tasting room.', now()),

  -- Portugal — Funchal (Madeira) LCDH
  ('lcdh-funchal-madeira', 'La Casa del Habano Funchal · Madeira', 'Funchal', 'Portugal', 'Avenida Arriaga 41-43, Galerias São Lourenço, 9000-060 Funchal', 32.6470, -16.9080, 'casadelhabano', 'http://www.lcdhmadeira.com/', 'Madeira island''s LCDH on Funchal''s main avenue. The only LCDH on a Portuguese island.', now()),

  -- France — Monaco Davidoff (Monte Carlo Cigar)
  ('monaco-davidoff-monte-carlo', 'Davidoff Monte-Carlo', 'Monte Carlo', 'Monaco', '17 Avenue des Spélugues, 98000 Monaco', 43.7398, 7.4275, 'retailer', 'https://www.montecarlocigar.com/', 'Davidoff''s Monte-Carlo cigar cellar in the Métropole Shopping Centre — operating since 2003.', now()),

  -- Germany — Stuttgart Davidoff Lounge at Steigenberger Graf Zeppelin
  ('stuttgart-davidoff-lounge-graf-zeppelin', 'Davidoff Lounge · Steigenberger Graf Zeppelin', 'Stuttgart', 'Germany', 'Arnulf-Klett-Platz 7, 70173 Stuttgart', 48.7838, 9.1810, 'lounge', 'https://hrewards.com/en/steigenberger-graf-zeppelin-stuttgart', 'Cigar lounge with cabinet humidor inside the 5-star Steigenberger Graf Zeppelin opposite Stuttgart Hbf. Habanos and Davidoff.', now())

ON CONFLICT (slug) DO NOTHING;
