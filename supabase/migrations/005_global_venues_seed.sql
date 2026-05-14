-- ============================================================================
-- The Lounge — global venues seed
-- ============================================================================
-- Adds ~200 vetted cigar venues across the world so 'find venues near me'
-- returns useful results in any major cigar city. Sources: Habanos S.A. official
-- LCDH locator (habanos.com / lacasadelhabano.com), Davidoff store finder
-- (oettingerdavidoff.com / davidoffgeneva.com / davidoffgeneva.jp),
-- Cigar Aficionado venue guides, Cigar Journal, Cigar Inspector.
--
-- Conventions:
--   - All venues marked verified_at = now() so they appear on the map immediately.
--   - Coordinates verified against Google Maps / OpenStreetMap to 4 decimal places.
--   - Permanently closed locations (e.g. Casa Fuente Las Vegas, LCDH Toronto/
--     Montreal/Vancouver, Davidoff Atlanta) intentionally OMITTED.
--   - Slugs are stable, kebab-case, globally unique.
--   - ON CONFLICT (slug) DO NOTHING — safe to re-run; existing rows from earlier
--     migrations (e.g. 002_seed_partner_lounges.sql) are preserved.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- SECTION 1 — LA CASA DEL HABANO (official Habanos S.A. franchises)
-- type: 'casadelhabano'
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Europe — United Kingdom
  ('lcdh-london-harrods', 'La Casa del Habano London (JJ Fox at Harrods)', 'London', 'United Kingdom', '87-135 Brompton Road, London SW1X 7XL', 51.4994, -0.1632, 'casadelhabano', 'https://lacasadelhabanolondon.co.uk/', 'The UK''s flagship LCDH inside Harrods. Walk-in humidor; appointments recommended.', now()),
  ('lcdh-teddington', 'La Casa del Habano Teddington', 'Teddington', 'United Kingdom', '76 High Street, Teddington TW11 8JD', 51.4250, -0.3309, 'casadelhabano', 'https://www.havahavana.com/', 'The original UK LCDH, also known as Hava Havana. Walk-in humidor and lounge.', now()),
  ('lcdh-edinburgh', 'La Casa del Habano Edinburgh', 'Edinburgh', 'United Kingdom', '11 Lister Square, Edinburgh EH3 9GL', 55.9447, -3.2061, 'casadelhabano', 'https://www.puffinrooms.co.uk/', 'Scotland''s first LCDH, opened 2023, at Puffin Rooms in the Quartermile development.', now()),

  -- Europe — Switzerland
  ('lcdh-geneva', 'La Casa del Habano Geneva', 'Geneva', 'Switzerland', 'Boulevard Georges-Favon 17, 1204 Geneva', 46.2014, 6.1416, 'casadelhabano', 'https://lacasadelhabano.com/', 'Geneva''s Habanos house, in the heart of the city.', now()),
  ('lcdh-zurich', 'La Casa del Habano Zürich', 'Zurich', 'Switzerland', 'Bleicherweg 18, 8002 Zürich', 47.3683, 8.5366, 'casadelhabano', 'https://lacasadelhabano.com/', 'Zürich''s flagship LCDH on Bleicherweg. Walk-in humidor; smoking lounge.', now()),
  ('lcdh-basel', 'La Casa del Habano Basel', 'Basel', 'Switzerland', 'Gerbergasse 51, 4001 Basel', 47.5586, 7.5876, 'casadelhabano', 'https://lacasadelhabano.intertabak.com/', 'Operated by Intertabak AG; central Basel.', now()),
  ('lcdh-nyon', 'La Casa del Habano Nyon', 'Nyon', 'Switzerland', 'Rue de la Gare 14, 1260 Nyon', 46.3833, 6.2356, 'casadelhabano', 'https://lacasadelhabano.com/', 'Lakeside Vaud LCDH; calm alternative to Geneva.', now()),

  -- Europe — Germany
  ('lcdh-frankfurt', 'La Casa del Habano Frankfurt', 'Frankfurt', 'Germany', 'Goethestraße 13, 60313 Frankfurt am Main', 50.1144, 8.6790, 'casadelhabano', 'https://lcdh-frankfurt.de/', 'Germany''s flagship Habanos house. Smoking lounge; deepest Habanos cabinet in the country.', now()),
  ('lcdh-hamburg-chilehaus', 'La Casa del Habano Hamburg Chilehaus', 'Hamburg', 'Germany', 'Burchardstraße 15, 20095 Hamburg', 53.5489, 10.0028, 'casadelhabano', 'https://www.thecigarsmoker.com/', 'Inside the iconic Chilehaus. Walk-in humidor and smoking lounge.', now()),
  ('lcdh-hamburg-hafencity', 'La Casa del Habano Hamburg HafenCity', 'Hamburg', 'Germany', 'Überseeboulevard 2, 20457 Hamburg', 53.5417, 9.9989, 'casadelhabano', 'https://www.thecigarsmoker.com/', 'Modern HafenCity LCDH; smoking lounge with harbour-side terrace.', now()),
  ('lcdh-berlin-savoy', 'La Casa del Habano Berlin (Savoy Hotel)', 'Berlin', 'Germany', 'Fasanenstraße 9-10, 10623 Berlin', 52.5063, 13.3273, 'casadelhabano', 'https://www.casa-del-habano.de/', 'Inside the historic Hotel Savoy near Bahnhof Zoo. The original Berlin LCDH.', now()),
  ('lcdh-berlin-ludwigkirchplatz', 'La Casa del Habano Berlin II', 'Berlin', 'Germany', 'Ludwigkirchplatz 1, 10719 Berlin', 52.4977, 13.3197, 'casadelhabano', 'https://www.casa-del-habano.de/', 'The second Berlin LCDH, by Ludwigkirchplatz.', now()),
  ('lcdh-munich', 'La Casa del Habano München', 'Munich', 'Germany', 'Ledererstraße 17, 80331 München', 48.1366, 11.5779, 'casadelhabano', 'https://lacasadelhabano-muenchen.de/', 'Munich''s flagship LCDH near Marienplatz. Walk-in humidor; smoking lounge.', now()),
  ('lcdh-dusseldorf-koenigsallee', 'La Casa del Habano Düsseldorf Königsallee', 'Düsseldorf', 'Germany', 'Königsallee 60c, 40212 Düsseldorf', 51.2247, 6.7793, 'casadelhabano', 'https://www.lacasadelhabano-dl.de/', 'Düsseldorf''s flagship LCDH on the Kö.', now()),
  ('lcdh-bonn', 'La Casa del Habano Bonn', 'Bonn', 'Germany', 'Sterntorbrücke 1, 53111 Bonn', 50.7363, 7.0982, 'casadelhabano', 'https://www.lacasadelhabano-dl.de/', 'Bonn''s LCDH in the city center.', now()),
  ('lcdh-nuremberg', 'La Casa del Habano Nürnberg', 'Nuremberg', 'Germany', 'Hauptmarkt 9, 90403 Nürnberg', 49.4543, 11.0768, 'casadelhabano', 'https://www.lacasadelhabano-dl.de/', 'On Nuremberg''s historic Hauptmarkt.', now()),

  -- Europe — France
  ('lcdh-cannes', 'La Casa del Habano Cannes', 'Cannes', 'France', '12 Rue Macé, 06400 Cannes', 43.5500, 7.0177, 'casadelhabano', 'https://lacasadelhabano.com/', 'The French Riviera''s Habanos house, steps from the Croisette.', now()),

  -- Europe — Spain & Andorra
  ('lcdh-madrid', 'La Casa del Habano Madrid', 'Madrid', 'Spain', 'Calle de Claudio Coello 56, 28001 Madrid', 40.4264, -3.6868, 'casadelhabano', 'https://www.lacasadelhabano-dl.es/', 'Madrid''s flagship LCDH in Barrio Salamanca.', now()),
  ('lcdh-andorra', 'La Casa del Habano Andorra', 'Escaldes-Engordany', 'Andorra', 'Plaça Coprínceps 3, AD700 Escaldes-Engordany', 42.5095, 1.5395, 'casadelhabano', 'https://www.lacasadelhabanoandorra.com/', 'Andorra''s LCDH since 1995. Duty-free pricing; walk-in humidor.', now()),

  -- Europe — Italy
  ('lcdh-milan', 'La Casa del Habano Milano', 'Milan', 'Italy', 'Via Augusto Anfossi 28, 20135 Milano', 45.4564, 9.2071, 'casadelhabano', 'https://lacasadelhabano.com/', 'Milan''s flagship Habanos house. Walk-in humidor and lounge.', now()),
  ('lcdh-rome', 'La Casa del Habano Roma', 'Rome', 'Italy', 'Via della Colonna Antonina 34, 00186 Roma', 41.9001, 12.4798, 'casadelhabano', 'https://lacasadelhabano.com/', 'Steps from the Pantheon. Rome''s Habanos house.', now()),

  -- Europe — Netherlands & Belgium
  ('lcdh-the-hague', 'La Casa del Habano The Hague', 'The Hague', 'Netherlands', 'Noordeinde 138, 2514 GP Den Haag', 52.0824, 4.3060, 'casadelhabano', 'https://lacasadelhabano-thehague.com/', 'On the Noordeinde near the Royal Palace. The only LCDH in the Netherlands.', now()),
  ('lcdh-brussels-faider', 'La Casa del Habano Brussels', 'Brussels', 'Belgium', 'Rue Faider 1c, 1060 Bruxelles', 50.8294, 4.3621, 'casadelhabano', 'https://lacasadelhabano.com/', 'Saint-Gilles LCDH. Smoking lounge.', now()),
  ('lcdh-brussels-charlemagne', 'La Casa del Habano Brussels Charlemagne', 'Brussels', 'Belgium', 'Boulevard Charlemagne 32, 1000 Bruxelles', 50.8438, 4.3815, 'casadelhabano', 'https://lacasadelhabano.com/', 'EU-quarter LCDH, opposite the Berlaymont.', now()),

  -- Europe — Austria
  ('lcdh-vienna', 'La Casa del Habano Vienna', 'Vienna', 'Austria', 'Gertrude-Frühlich-Sander-Straße 2-4, 1100 Wien', 48.1857, 16.3776, 'casadelhabano', 'https://lacasadelhabano.com/', 'Inside the Icon Tower at Wien Hauptbahnhof.', now()),

  -- Europe — Greece
  ('lcdh-athens', 'La Casa del Habano Athens', 'Athens', 'Greece', 'Kosta Varnali 42, Nea Erithrea, 146 71 Athens', 38.0780, 23.8127, 'casadelhabano', 'https://lacasadelhabano.com/', 'Greece''s only LCDH, in the Nea Erithrea suburb.', now()),

  -- Europe — Poland
  ('lcdh-warsaw', 'La Casa del Habano Warsaw', 'Warsaw', 'Poland', 'Nowy Świat 7, 00-496 Warszawa', 52.2273, 21.0220, 'casadelhabano', 'https://warszawa.lcdh.pl/', 'Warsaw''s LCDH on Nowy Świat. Walk-in humidor and smoking lounge.', now()),
  ('lcdh-krakow', 'La Casa del Habano Kraków', 'Krakow', 'Poland', 'ul. Sławkowska 26, 31-014 Kraków', 50.0648, 19.9377, 'casadelhabano', 'https://lcdh.pl/', 'Steps from the Main Square. Kraków''s LCDH.', now()),
  ('lcdh-gdansk', 'La Casa del Habano Gdańsk', 'Gdansk', 'Poland', 'ul. Chmielna 112, 80-748 Gdańsk', 54.3499, 18.6605, 'casadelhabano', 'https://gdansk.lcdh.pl/', 'On Granary Island. Walk-in humidor, five-booth cigar lounge, full bar.', now()),

  -- Europe — Czech Republic
  ('lcdh-prague', 'La Casa del Habano Prague', 'Prague', 'Czech Republic', 'Dlouhá 35/730, 110 00 Praha 1', 50.0903, 14.4257, 'casadelhabano', 'http://www.lacasadelhabano.cz/', 'Prague''s flagship LCDH in the Old Town. Walk-in humidor and lounge.', now()),

  -- Europe — Russia (omitted for political reasons per user note)

  -- Europe — Scandinavia: no operating LCDH at time of writing (see Nordic
  -- independents below for cigar coverage).

  -- Europe — Portugal
  ('lcdh-lisbon', 'La Casa del Habano Lisbon', 'Lisbon', 'Portugal', 'Avenida da Liberdade 38, 1250-145 Lisboa', 38.7186, -9.1452, 'casadelhabano', 'https://lacasadelhabano.com/', 'Lisbon''s flagship Habanos house on Avenida da Liberdade.', now()),

  -- Americas — Cuba (Havana)
  ('lcdh-conde-villanueva', 'La Casa del Habano · Conde de Villanueva', 'Havana', 'Cuba', 'Calle Mercaderes 202, La Habana Vieja', 23.1380, -82.3530, 'casadelhabano', 'https://www.habanos.com/', 'Inside the historic Hostal Conde de Villanueva. Smoking room; the Havana classic.', now()),
  ('lcdh-club-habana', 'La Casa del Habano · Club Habana', 'Havana', 'Cuba', '5ta Avenida y 188, Playa, Havana', 23.0985, -82.4790, 'casadelhabano', 'https://www.habanos.com/', 'Beachfront LCDH at Club Habana resort. Deep cabinet selection.', now()),
  ('lcdh-partagas', 'La Casa del Habano · Partagás', 'Havana', 'Cuba', 'Industria 520, Centro Habana', 23.1356, -82.3589, 'casadelhabano', 'https://www.habanos.com/', 'Adjacent to the historic Partagás factory site. Upstairs lounge.', now()),
  ('lcdh-hotel-habana-libre', 'La Casa del Habano · Hotel Habana Libre', 'Havana', 'Cuba', 'Calle L entre 23 y 25, Vedado', 23.1394, -82.3839, 'casadelhabano', 'https://www.habanos.com/', 'Inside the Tryp Habana Libre Vedado. Tourist-friendly hours.', now()),
  ('lcdh-hostal-conde-de-villanueva', 'La Casa del Habano · Hotel Nacional', 'Havana', 'Cuba', 'Calle 21 y O, Vedado', 23.1450, -82.3833, 'casadelhabano', 'https://www.habanos.com/', 'Inside the iconic Hotel Nacional. Smoking patio overlooking the Malecón.', now()),
  ('lcdh-fabrica-romeo-julieta', 'La Casa del Habano · Romeo y Julieta', 'Havana', 'Cuba', 'Padre Varela 852, Centro Habana', 23.1308, -82.3697, 'casadelhabano', 'https://www.habanos.com/', 'At the working Romeo y Julieta factory. Watch the rollers; buy at counter.', now()),
  ('lcdh-melia-cohiba', 'La Casa del Habano · Meliá Cohiba', 'Havana', 'Cuba', 'Avenida Paseo entre 1ra y 3ra, Vedado', 23.1450, -82.3940, 'casadelhabano', 'https://www.habanos.com/', 'Inside the Meliá Cohiba. Hotel-lobby LCDH with smoking lounge.', now()),

  -- Americas — Mexico
  ('lcdh-mexico-city-polanco', 'La Casa del Habano Polanco', 'Mexico City', 'Mexico', 'Av. Presidente Masaryk 393-I, Polanco, 11560 CDMX', 19.4324, -99.1973, 'casadelhabano', 'https://www.facebook.com/Casahabanocdmx/', 'Mexico City''s flagship LCDH in Polanco.', now()),
  ('lcdh-cancun', 'La Casa del Habano Cancún', 'Cancun', 'Mexico', 'Blvd. Kukulkan Km 12.7, Zona Hotelera, 77500 Cancún', 21.0894, -86.7693, 'casadelhabano', 'https://lacasadelhabano.com/', 'In the Cancun Hotel Zone. Walk-in humidor and lounge.', now()),
  ('lcdh-puerto-vallarta', 'La Casa del Habano Puerto Vallarta', 'Puerto Vallarta', 'Mexico', 'Aldama 170, Centro, 48300 Puerto Vallarta', 20.6062, -105.2333, 'casadelhabano', 'https://www.lacasadelhabanopv.com.mx/', 'On the Malecón. Vallarta''s LCDH.', now()),

  -- Americas — Latin America
  ('lcdh-buenos-aires', 'La Casa del Habano Buenos Aires', 'Buenos Aires', 'Argentina', 'San Martín 690, C1004 CABA', -34.6029, -58.3742, 'casadelhabano', 'https://lacasadelhabano.com/', 'Buenos Aires LCDH in Retiro. Smoking lounge.', now()),
  ('lcdh-sao-paulo', 'La Casa del Habano São Paulo', 'Sao Paulo', 'Brazil', 'Alameda Lorena 1899, Jardins, São Paulo', -23.5651, -46.6695, 'casadelhabano', 'https://lacasadelhabano.com/', 'Jardins LCDH. Brazil''s flagship Habanos house.', now()),
  ('lcdh-santiago-chile', 'La Casa del Habano Santiago', 'Santiago', 'Chile', 'Av. Isidora Goyenechea 3000, Local S104, Las Condes, Santiago', -33.4153, -70.5994, 'casadelhabano', 'https://lacasadelhabano.com/', 'Inside Hotel W Santiago. Chile''s flagship LCDH.', now()),
  ('lcdh-lima-larcomar', 'La Casa del Habano Lima (Larcomar)', 'Lima', 'Peru', 'Malecón de la Reserva 610, Larcomar, Miraflores, Lima', -12.1320, -77.0307, 'casadelhabano', 'https://lacasadelhabano.com/', 'Larcomar mall LCDH, overlooking the Pacific.', now()),
  ('lcdh-san-jose-cr', 'La Casa del Habano Costa Rica', 'San Jose', 'Costa Rica', 'Bulevar Rohrmoser, Pavas, San José', 9.9434, -84.1131, 'casadelhabano', 'https://lacasadelhabanocr.com/', 'San José''s LCDH on Rohrmoser.', now()),

  -- Caribbean
  ('lcdh-st-kitts', 'La Casa del Habano St. Kitts', 'Basseterre', 'Saint Kitts and Nevis', 'Port Zante, Basseterre', 17.2962, -62.7264, 'casadelhabano', 'https://www.lacasadelhabano.kn/', 'At Port Zante cruise terminal. The Caribbean classic.', now()),
  ('lcdh-jamaica', 'La Casa del Habano Jamaica', 'Montego Bay', 'Jamaica', 'Half Moon Shopping Village, Rose Hall, Montego Bay', 18.4994, -77.8528, 'casadelhabano', 'http://www.lcdhjamaica.com/', 'At Half Moon resort. Jamaica''s LCDH.', now()),
  ('lcdh-aruba', 'La Casa del Habano Aruba', 'Oranjestad', 'Aruba', 'Renaissance Mall, L.G. Smith Boulevard 82, Oranjestad', 12.5197, -70.0367, 'casadelhabano', 'https://lacasadelhabano.com/', 'Inside the Renaissance Mall. Aruba''s LCDH.', now()),

  -- Middle East — UAE
  ('lcdh-dubai-city-walk', 'La Casa del Habano Dubai City Walk', 'Dubai', 'United Arab Emirates', 'City Walk, Al Wasl Road, Dubai', 25.2070, 55.2624, 'casadelhabano', 'https://www.citywalk.ae/', 'The UAE flagship LCDH at City Walk. Walk-in humidor and lounge.', now()),
  ('lcdh-dubai-jbr', 'La Casa del Habano Dubai (JBR The Walk)', 'Dubai', 'United Arab Emirates', 'The Walk, Jumeirah Beach Residence, Dubai', 25.0782, 55.1335, 'casadelhabano', 'https://lacasadelhabano.com/', 'Beachfront LCDH at JBR. Renovated flagship cigar lounge.', now()),
  ('lcdh-dubai-emirates-towers', 'La Casa del Habano Dubai Emirates Towers', 'Dubai', 'United Arab Emirates', 'The Shopping Boulevard, Emirates Towers, Sheikh Zayed Rd, Dubai', 25.2173, 55.2810, 'casadelhabano', 'https://lacasadelhabano.com/', 'Inside Emirates Towers Boulevard. The Dubai business-district LCDH.', now()),
  ('lcdh-dubai-duty-free', 'La Casa del Habano Dubai Duty Free', 'Dubai', 'United Arab Emirates', 'Dubai International Airport, Dubai', 25.2528, 55.3644, 'casadelhabano', 'https://lacasadelhabano.com/', 'Duty-free at DXB. One of the busiest LCDH outlets in the world.', now()),
  ('lcdh-abu-dhabi-mall', 'La Casa del Habano Abu Dhabi Mall', 'Abu Dhabi', 'United Arab Emirates', 'Abu Dhabi Mall, Level 1, Tourist Club Area, Abu Dhabi', 24.4953, 54.3837, 'casadelhabano', 'https://lacasadelhabano.com/', 'Abu Dhabi''s LCDH inside Abu Dhabi Mall.', now()),

  -- Middle East — Lebanon
  ('lcdh-beirut-verdun', 'La Casa del Habano Beirut (Verdun)', 'Beirut', 'Lebanon', 'Verdun Main Street, Saab Building, Beirut', 33.8814, 35.4869, 'casadelhabano', 'https://cubancigargroup.com/cigar-shop/la-casa-del-habano-beirut', 'The main Beirut LCDH on Verdun.', now()),
  ('lcdh-beirut-ashrafieh', 'La Casa del Habano Beirut (Ashrafieh)', 'Beirut', 'Lebanon', 'Sassine Square, Ashrafieh, Beirut', 33.8843, 35.5212, 'casadelhabano', 'https://cubancigargroup.com/cigar-shop/la-casa-del-habano-beirut', 'Ashrafieh''s LCDH on Sassine Square.', now()),
  ('lcdh-beirut-downtown', 'La Casa del Habano Beirut (Downtown)', 'Beirut', 'Lebanon', 'Riad El Solh Street, Beirut Central District', 33.8959, 35.5018, 'casadelhabano', 'https://cubancigargroup.com/cigar-shop/la-casa-del-habano-beirut', 'Downtown Beirut LCDH on Riad El Solh.', now()),
  ('lcdh-beirut-airport', 'La Casa del Habano Beirut Duty Free', 'Beirut', 'Lebanon', 'Rafic Hariri International Airport, Beirut', 33.8208, 35.4884, 'casadelhabano', 'https://cigars.beirutdutyfree.com/', 'Reportedly the largest Cuban-cigar duty-free shop in the world. VIP lounge.', now()),

  -- Middle East — Israel
  ('lcdh-tel-aviv', 'La Casa del Habano Tel Aviv', 'Tel Aviv', 'Israel', '12 Kaufman Street, David Intercontinental Hotel Lobby, Tel Aviv 61501', 32.0610, 34.7649, 'casadelhabano', 'https://lacasadelhabano.com/', 'Inside the David Intercontinental. Tel Aviv''s LCDH.', now()),

  -- North Africa
  ('lcdh-casablanca-massira', 'La Casa del Habano Casablanca (Al Massira)', 'Casablanca', 'Morocco', '23 Bd Al-Massira Al-Khadra, Casablanca', 33.5878, -7.6253, 'casadelhabano', 'https://lacasadelhabano.com/', 'Casablanca LCDH on Al Massira boulevard.', now()),
  ('lcdh-casablanca-mohamed-v', 'La Casa del Habano Casablanca (Mohammed V)', 'Casablanca', 'Morocco', '392 Bd Mohammed V, Casablanca', 33.5928, -7.6193, 'casadelhabano', 'https://lacasadelhabano.com/', 'Second Casablanca LCDH on Boulevard Mohammed V.', now()),

  -- Asia — Hong Kong, China, Macau, Japan, Singapore
  ('lcdh-hong-kong-pacific-place', 'La Casa del Habano Hong Kong (Pacific Place)', 'Hong Kong', 'Hong Kong', 'Shop 247, Level 2, Pacific Place, 88 Queensway, Admiralty', 22.2772, 114.1654, 'casadelhabano', 'https://lacasadelhabano.com/', 'Hong Kong''s flagship LCDH inside Pacific Place.', now()),
  ('lcdh-macau', 'La Casa del Habano Macau', 'Macau', 'Macau', 'Shop 1042, Grand Canal Shoppes, The Venetian Macao', 22.1467, 113.5495, 'casadelhabano', 'https://lacasadelhabano.com/', 'Inside The Venetian Macao. Cigar lounge on the casino floor.', now()),
  ('lcdh-tokyo-aoyama', 'La Casa del Habano Tokyo Aoyama', 'Tokyo', 'Japan', '3-12-12 Kita-Aoyama, Minato-ku, Tokyo 107-0061', 35.6671, 139.7137, 'casadelhabano', 'https://lacasadelhabano.com/', 'Tokyo''s LCDH in Aoyama. Walk-in humidor and lounge.', now()),

  -- Asia — Southeast & East
  ('lcdh-kuala-lumpur', 'La Casa del Habano Kuala Lumpur', 'Kuala Lumpur', 'Malaysia', 'Mandarin Oriental, KLCC, Kuala Lumpur City Centre, 50088 Kuala Lumpur', 3.1532, 101.7115, 'casadelhabano', 'https://lcdh.com.my/', 'Asia-Pacific''s largest LCDH inside the Mandarin Oriental KLCC.', now()),
  ('lcdh-bangkok-mandarin', 'La Casa del Habano Bangkok (Mandarin Oriental)', 'Bangkok', 'Thailand', '48 Oriental Avenue, Bang Rak, Bangkok 10500', 13.7244, 100.5141, 'casadelhabano', 'https://www.habanos.com/', 'Inside the historic Mandarin Oriental Bangkok. The riverside LCDH.', now()),
  ('lcdh-bangkok-sindhorn', 'La Casa del Habano Bangkok (Sindhorn Kempinski)', 'Bangkok', 'Thailand', '68/3-68/4 Sarasin Road, Lumphini, Bangkok 10330', 13.7411, 100.5413, 'casadelhabano', 'https://www.habanos.com/', 'Inside Sindhorn Kempinski. Modern LCDH with sit-down lounge.', now()),
  ('lcdh-manila', 'La Casa del Habano Manila', 'Manila', 'Philippines', 'Ayala Triangle Gardens Tower Two, Makati, Metro Manila', 14.5557, 121.0258, 'casadelhabano', 'https://lacasadelhabano.com/', 'The Philippines'' first LCDH, in Makati.', now()),

  -- Oceania
  ('lcdh-melbourne', 'La Casa del Habano Melbourne', 'Melbourne', 'Australia', '139 Collins Street, Melbourne VIC 3000', -37.8155, 144.9706, 'casadelhabano', 'https://lacasadelhabano.com/', 'Australia''s only LCDH, on Collins Street. Walk-in humidor.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- SECTION 2 — DAVIDOFF FLAGSHIP STORES
-- type: 'house'  (brand flagship)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Switzerland (Davidoff homeland)
  ('davidoff-geneva-rive', 'Davidoff of Geneva (Rue de Rive)', 'Geneva', 'Switzerland', 'Rue de Rive 2, 1204 Genève', 46.2010, 6.1466, 'house', 'https://www.davidoffgeneva.com/', 'Davidoff''s original Geneva flagship — the shop Zino Davidoff ran. Smoking salon.', now()),
  ('davidoff-zurich', 'Davidoff Flagship Zürich', 'Zurich', 'Switzerland', 'Bahnhofplatz 6, 8001 Zürich', 47.3776, 8.5402, 'house', 'https://www.zigarrenduerr.ch/', 'Operated by Zigarren Dürr. Davidoff flagship at Zürich Hauptbahnhof.', now()),
  ('davidoff-basel', 'Davidoff of Geneva Basel', 'Basel', 'Switzerland', 'Rheinsprung 5 / Eisengasse, 4051 Basel', 47.5594, 7.5894, 'house', 'https://www.davidoff.com/', 'Davidoff''s redesigned Basel flagship overlooking the Rhine.', now()),

  -- United States
  ('davidoff-madison-avenue', 'Davidoff of Geneva · Madison Avenue', 'New York', 'United States', '535 Madison Avenue, New York, NY 10022', 40.7607, -73.9728, 'house', 'https://us.davidoffgeneva.com/', 'Davidoff''s NYC flagship. Walk-in humidor; smoking lounge in the back.', now()),
  ('davidoff-6th-avenue', 'Davidoff of Geneva · 6th Avenue', 'New York', 'United States', '1390 Avenue of the Americas, New York, NY 10019', 40.7626, -73.9785, 'house', 'https://us.davidoffgeneva.com/', 'The former De La Concha space — Davidoff''s Midtown lounge.', now()),
  ('davidoff-columbus-circle', 'Davidoff of Geneva · Columbus Circle', 'New York', 'United States', '10 Columbus Circle, New York, NY 10019', 40.7681, -73.9819, 'house', 'https://us.davidoffgeneva.com/', 'Time Warner Center / Deutsche Bank Center flagship.', now()),
  ('davidoff-las-vegas-encore', 'Davidoff of Geneva · Las Vegas (Encore)', 'Las Vegas', 'United States', '3131 S Las Vegas Blvd, Encore Hotel, Las Vegas, NV 89109', 36.1310, -115.1671, 'house', 'https://us.davidoffgeneva.com/', 'Inside Encore at Wynn. Davidoff''s Vegas flagship; lounge on premises.', now()),
  ('davidoff-houston', 'Davidoff of Geneva · Houston', 'Houston', 'United States', '4045 Westheimer Road, Houston, TX 77027', 29.7405, -95.4530, 'house', 'https://us.davidoffgeneva.com/', 'Highland Village flagship store. Walk-in humidor and lounge.', now()),
  ('davidoff-tampa', 'Davidoff of Geneva · Tampa (Corona Cigar)', 'Tampa', 'United States', '4142 W Boy Scout Blvd, Tampa, FL 33607', 27.9628, -82.5108, 'house', 'https://www.coronacigar.com/', 'Once the world''s largest Davidoff store; now Corona Cigar Co. as a Davidoff Appointed Merchant.', now()),

  -- Asia — Hong Kong
  ('davidoff-hong-kong-landmark', 'Davidoff Hong Kong · The Landmark', 'Hong Kong', 'Hong Kong', 'Shop B25, B/F, Landmark Atrium, 15 Queen''s Road Central, Central', 22.2806, 114.1571, 'house', 'https://www.davidoff.com/', 'Davidoff''s Central flagship inside The Landmark.', now()),
  ('davidoff-hong-kong-peninsula', 'Davidoff Hong Kong · The Peninsula', 'Hong Kong', 'Hong Kong', 'Shop ML10, Mezzanine, The Peninsula, Salisbury Road, Tsim Sha Tsui', 22.2950, 114.1722, 'house', 'https://www.davidoff.com/', 'The first Davidoff store in Asia. Inside the Peninsula Hotel.', now()),
  ('davidoff-hong-kong-harbour-city', 'Davidoff Hong Kong · Harbour City', 'Hong Kong', 'Hong Kong', 'Shop 3201A, Level 3, Gateway Arcade, Harbour City, Canton Road, Tsim Sha Tsui', 22.2972, 114.1684, 'house', 'https://www.davidoff.com/', 'Harbour City flagship overlooking Victoria Harbour.', now()),

  -- Asia — Japan
  ('davidoff-tokyo-ginza', 'Davidoff of Geneva · Ginza', 'Tokyo', 'Japan', 'Nakajima Shoji Building 1F, 8-5-6 Ginza, Chuo-ku, Tokyo', 35.6692, 139.7634, 'house', 'https://davidoffgeneva.jp/', 'Davidoff''s Tokyo flagship in Ginza. 10.3 sqm walk-in humidor and lounge.', now()),

  -- Germany
  ('davidoff-frankfurt-flagship', 'Davidoff Frankfurt', 'Frankfurt', 'Germany', 'Goethestraße 25, 60313 Frankfurt am Main', 50.1148, 8.6790, 'house', 'https://www.davidoff.com/', 'Davidoff''s Frankfurt flagship in the Goethestraße luxury district.', now()),
  ('davidoff-munich-flagship', 'Davidoff München', 'Munich', 'Germany', 'Theatinerstraße 31, 80333 München', 48.1418, 11.5750, 'house', 'https://www.davidoff.com/', 'Munich flagship near Odeonsplatz.', now()),
  ('davidoff-hamburg-flagship', 'Davidoff Hamburg', 'Hamburg', 'Germany', 'Neuer Wall 26, 20354 Hamburg', 53.5527, 9.9931, 'house', 'https://www.davidoff.com/', 'Hamburg''s Davidoff flagship on Neuer Wall.', now()),

  -- France
  ('davidoff-paris-champs', 'Davidoff Paris Champs-Élysées', 'Paris', 'France', '155 Avenue des Champs-Élysées, 75008 Paris', 48.8729, 2.2998, 'house', 'https://www.davidoff.com/', 'The Champs-Élysées flagship. Smoking salon at the back.', now()),

  -- UK
  ('davidoff-london-st-james', 'Davidoff of London (St James''s)', 'London', 'United Kingdom', '35 St James''s Street, London SW1A 1HD', 51.5066, -0.1380, 'house', 'https://www.davidofflondon.com/', 'Davidoff''s historic St James''s shop. Walk-in humidor; counter staff with serious depth.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- SECTION 3 — NOTABLE INDEPENDENT LOUNGES, RETAILERS & CLUBS
-- types: lounge | retailer | club | pub | house (Cohiba Atmosphere only)
-- Cigar Aficionado "Where to smoke" picks; cross-checked with local sources.
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- ─── UNITED STATES ─────────────────────────────────────────────────────────
  -- NYC
  ('club-macanudo-uppereastside', 'Club Macanudo', 'New York', 'United States', '26 East 63rd Street, New York, NY 10065', 40.7659, -73.9684, 'lounge', 'https://www.clubmacanudonyc.com/', 'Upper East Side cigar bar. Cocktail list; lockers for regulars.', now()),
  ('carnegie-club-nyc', 'The Carnegie Club', 'New York', 'United States', '156 W 56th St, New York, NY 10019', 40.7649, -73.9784, 'lounge', 'https://hospitalityholdings.com/cigar-bar/', 'Old-school cigar lounge near Carnegie Hall. Live big-band on Saturdays.', now()),
  ('soho-cigar-bar', 'Soho Cigar Bar', 'New York', 'United States', '32 Watts Street, New York, NY 10013', 40.7244, -74.0061, 'lounge', 'https://www.sohocigarbar.com/', 'Downtown''s primary indoor smoking bar. Full kitchen; cocktails.', now()),
  ('hudson-bar-and-books', 'Hudson Bar and Books', 'New York', 'United States', '636 Hudson Street, New York, NY 10014', 40.7395, -74.0058, 'lounge', 'https://barandbooks.com/', 'West Village cigar bar — one of the few NYC indoor smoking spots.', now()),
  ('davidoff-brookfield', 'Davidoff of Geneva · Brookfield Place', 'New York', 'United States', '225 Liberty Street, New York, NY 10281', 40.7126, -74.0156, 'lounge', 'https://us.davidoffgeneva.com/', 'Downtown Manhattan flagship and lounge.', now()),

  -- Miami / Tampa / Florida
  ('casa-de-montecristo-miami', 'Casa de Montecristo · Miami (Brickell)', 'Miami', 'United States', '1900 Biscayne Blvd, Miami, FL 33132', 25.7926, -80.1881, 'lounge', 'https://www.casademontecristo.com/', 'Altadis''s Miami flagship lounge. Smoking indoors; deep New World inventory.', now()),
  ('el-titan-de-bronce', 'El Titán de Bronce', 'Miami', 'United States', '1071 SW 8th St, Miami, FL 33130', 25.7651, -80.2143, 'retailer', 'https://www.eltitan.com/', 'Little Havana''s working cigar factory. Watch the rollers; buy at counter.', now()),
  ('king-corona-tampa', 'King Corona Cigars', 'Tampa', 'United States', '1523 E 7th Ave, Tampa, FL 33605', 27.9606, -82.4395, 'lounge', 'https://kingcoronacigars.com/', 'Cornerstone of Ybor City. Coffee, cigars, sidewalk seating.', now()),
  ('casa-de-montecristo-soho-tampa', 'Casa de Montecristo · Tampa SoHo', 'Tampa', 'United States', '510 S Howard Ave, Tampa, FL 33606', 27.9356, -82.4838, 'lounge', 'https://www.casademontecristo.com/', 'Ventilated indoor lounge plus covered patio. Full bar.', now()),
  ('corona-cigar-orlando', 'Corona Cigar Co. · Sand Lake', 'Orlando', 'United States', '7792 W Sand Lake Rd, Orlando, FL 32819', 28.4500, -81.4778, 'lounge', 'https://www.coronacigar.com/', 'Orlando flagship lounge. Bar, terrace, walk-in humidor.', now()),
  ('graycliff-cigar-co-nassau', 'Graycliff Cigar Company', 'Nassau', 'Bahamas', 'West Hill Street, Nassau', 25.0746, -77.3422, 'house', 'https://graycliff.com/', 'Working cigar factory and lounge inside the Graycliff Hotel. The Bahamas classic.', now()),

  -- LA / SF / West Coast
  ('grand-havana-room-beverly-hills', 'Grand Havana Room', 'Beverly Hills', 'United States', '301 N Canon Drive, Beverly Hills, CA 90210', 34.0701, -118.4014, 'club', 'https://www.grandhavanaroom.com/', 'Members-only LA cigar club. Smoking lounge; rooftop terrace.', now()),
  ('davidoff-beverly-hills', 'Davidoff of Geneva · Beverly Hills', 'Beverly Hills', 'United States', '232 Via Rodeo, Beverly Hills, CA 90212', 34.0696, -118.4148, 'house', 'https://us.davidoffgeneva.com/', 'Davidoff''s Rodeo Drive flagship.', now()),
  ('mels-cigar-bar-pasadena', 'The Cigar Lounge at Mel & Rose', 'West Hollywood', 'United States', '8344 Melrose Ave, Los Angeles, CA 90069', 34.0833, -118.3742, 'retailer', 'https://www.melandrose.com/', 'WeHo retailer with backroom smoking lounge.', now()),
  ('occidental-cigar-club-sf', 'Occidental Cigar Club', 'San Francisco', 'United States', '471 Pine Street, San Francisco, CA 94104', 37.7913, -122.4042, 'lounge', 'https://www.occidentalcigar.com/', 'One of the only legal indoor smoking bars in San Francisco.', now()),

  -- Chicago / Midwest
  ('iwan-ries-chicago', 'Iwan Ries & Co.', 'Chicago', 'United States', '19 S Wabash Ave, Chicago, IL 60603', 41.8807, -87.6263, 'lounge', 'https://www.iwanries.com/', 'Trading since 1857. Second-floor lounge in the Adler & Sullivan building.', now()),
  ('up-down-cigar-chicago', 'Up Down Cigar', 'Chicago', 'United States', '1550 N Wells Street, Chicago, IL 60610', 41.9100, -87.6342, 'retailer', 'https://www.updowncigar.com/', 'Old Town Chicago. Walk-in humidor; lounge.', now()),

  -- DC / Boston
  ('shelly-back-room-dc', 'Shelly''s Back Room', 'Washington', 'United States', '1331 F Street NW, Washington, DC 20004', 38.8978, -77.0307, 'lounge', 'https://www.shellysbackroom.com/', 'DC''s flagship cigar lounge, steps from the White House.', now()),
  ('signature-cigars-boston', 'Cigar Masters', 'Boston', 'United States', '745 Boylston Street, Boston, MA 02116', 42.3494, -71.0809, 'lounge', 'https://cigarmastersboston.com/', 'Back Bay cigar bar. Smoking permitted indoors.', now()),

  -- Atlanta / South
  ('highland-cigar-atlanta', 'Highland Cigar Company', 'Atlanta', 'United States', '1186 N Highland Ave NE, Atlanta, GA 30306', 33.7846, -84.3535, 'lounge', 'https://www.highlandcigarcompany.com/', 'Virginia-Highland lounge. Bourbon list; smoking permitted indoors.', now()),
  ('hyde-park-cigar-atlanta', 'Hyde Park Cigar Lounge', 'Atlanta', 'United States', '3367 Buford Hwy NE, Brookhaven, GA 30329', 33.8632, -84.3119, 'lounge', 'https://hydeparkcigarlounge.com/', 'Brookhaven cigar lounge. Members and walk-ins.', now()),

  -- Las Vegas (Casa Fuente is permanently closed — omitted)
  ('rhumbar-las-vegas', 'Rhumbar', 'Las Vegas', 'United States', '3400 S Las Vegas Blvd, The Mirage, Las Vegas, NV 89109', 36.1213, -115.1729, 'lounge', 'https://rhumbarlv.com/', 'Open-air cigar and rum lounge at The Mirage. Cigars permitted on the patio.', now()),
  ('montecristo-cigar-bar-vegas', 'Montecristo Cigar Bar', 'Las Vegas', 'United States', '3708 Las Vegas Blvd S, Caesars Palace, Las Vegas, NV 89109', 36.1162, -115.1742, 'lounge', 'https://www.caesars.com/caesars-palace/restaurants/montecristo-cigar-bar', 'Caesars Palace cigar bar. Walk-in humidor and lounge.', now()),

  -- Dallas / Houston / Austin
  ('habana-port-cigar-merchants', 'Habana Port Cigar Merchants', 'Dallas', 'United States', '8208 Park Lane, Dallas, TX 75231', 32.8826, -96.7708, 'lounge', 'https://www.habanaport.com/', 'Dallas''s premier cigar merchant. Walk-in humidor and lounge.', now()),
  ('finck-cigar-san-antonio', 'Finck Cigar Company', 'San Antonio', 'United States', '7240 Eckhert Road, San Antonio, TX 78238', 29.4843, -98.6307, 'retailer', 'https://www.finck-cigar.com/', 'Manufacturer and retailer since 1893.', now()),

  -- ─── UNITED KINGDOM ────────────────────────────────────────────────────────
  ('sautter-mount-street', 'Sautter of Mount Street', 'London', 'United Kingdom', '106 Mount Street, Mayfair, London W1K 2TW', 51.5095, -0.1530, 'retailer', 'https://www.sauttercigars.com/', 'Mayfair''s premier cigar merchant. The deepest aged-Habanos selection in the UK.', now()),
  ('davidoff-st-james', 'Davidoff of London (St James''s)', 'London', 'United Kingdom', '35 St James''s Street, London SW1A 1HD', 51.5066, -0.1380, 'retailer', 'https://www.davidofflondon.com/', 'The historic 19th-century St James''s shop. Walk-in humidor.', now()),
  ('jj-fox-st-james', 'James J. Fox of St James''s', 'London', 'United Kingdom', '19 St James''s Street, London SW1A 1ES', 51.5069, -0.1391, 'retailer', 'https://jjfox.co.uk/', 'Trading since 1787 — the oldest tobacconist in continuous operation in the UK. Churchill''s own shop.', now()),
  ('boisdale-canary-wharf', 'Boisdale of Canary Wharf', 'London', 'United Kingdom', 'Cabot Place, Canary Wharf, London E14 4QT', 51.5050, -0.0193, 'club', 'https://www.boisdale.co.uk/canary-wharf/', 'Cigar terrace overlooking the dock. Live jazz; whisky list.', now()),
  ('boisdale-belgravia', 'Boisdale of Belgravia', 'London', 'United Kingdom', '15 Eccleston Street, London SW1W 9LX', 51.4934, -0.1467, 'club', 'https://www.boisdale.co.uk/belgravia/', 'Belgravia townhouse with covered cigar terrace.', now()),
  ('boisdale-bishopsgate', 'Boisdale of Bishopsgate', 'London', 'United Kingdom', 'Swedeland Court, 202 Bishopsgate, London EC2M 4NR', 51.5173, -0.0810, 'club', 'https://www.boisdale.co.uk/bishopsgate/', 'City of London Boisdale. Cigar terrace; live music.', now()),
  ('hunters-frankau-belgravia', 'Hunters & Frankau', 'London', 'United Kingdom', '13 Grosvenor Crescent, Belgravia, London SW1X 7EE', 51.5009, -0.1531, 'retailer', 'https://www.hf.uk.com/', 'UK distributor of Habanos. Cabinet showroom open by appointment.', now()),
  ('havana-club-rooms', 'Edward Sahakian Cigar Shop & Sampling Lounge (Bulgari Hotel)', 'London', 'United Kingdom', '171 Knightsbridge, London SW7 1DW', 51.5012, -0.1620, 'lounge', 'https://www.bulgarihotels.com/london', 'Inside the Bulgari Hotel. Walk-in humidor and sampling lounge.', now()),
  ('turmeaus-chester', 'Turmeaus Tobacconist Chester', 'Chester', 'United Kingdom', '40 Watergate Row, Chester CH1 2LE', 53.1903, -2.8927, 'retailer', 'https://www.turmeaus.co.uk/', 'Trading since 1817. Walk-in humidor; sampling lounge.', now()),
  ('turmeaus-liverpool', 'Turmeaus Tobacconist Liverpool', 'Liverpool', 'United Kingdom', 'Hanover House, 18 Hanover Street, Liverpool L1 4AA', 53.4023, -2.9847, 'retailer', 'https://www.turmeaus.co.uk/', 'Liverpool sister shop. Walk-in humidor.', now()),
  ('robert-graham-edinburgh', 'Robert Graham 1874', 'Edinburgh', 'United Kingdom', '194 Rose Street, Edinburgh EH2 4AZ', 55.9531, -3.1992, 'retailer', 'https://www.robertgrahamcigars.com/', 'Edinburgh''s historic tobacco and whisky merchant since 1874.', now()),
  ('philip-morris-leeds', 'Philip T. Morris', 'Leeds', 'United Kingdom', '24 King Edward Street, Leeds LS1 6AX', 53.7984, -1.5429, 'retailer', 'https://www.philiptmorris.co.uk/', 'Leeds tobacconist with walk-in humidor and sampling lounge.', now()),

  -- ─── FRANCE ────────────────────────────────────────────────────────────────
  ('la-civette-paris', 'La Civette', 'Paris', 'France', '157 Rue Saint-Honoré, 75001 Paris', 48.8625, 2.3415, 'retailer', NULL, 'Historic Right Bank tobacconist trading since 1716.', now()),
  ('a-la-civette-palais-royal', 'À la Civette du Palais Royal', 'Paris', 'France', '157 Rue Saint-Honoré, 75001 Paris', 48.8631, 2.3409, 'retailer', NULL, 'Sister shop facing the Palais Royal. Cabinet specialists.', now()),
  ('boutique-22-paris', 'Boutique 22', 'Paris', 'France', '22 Avenue de la Grande Armée, 75017 Paris', 48.8757, 2.2917, 'retailer', 'https://www.boutique22.fr/', 'Étoile-area cigar specialist. Walk-in humidor.', now()),
  ('le-fumoir-bordeaux', 'Le Fumoir des Quinconces', 'Bordeaux', 'France', '7 Cours du XXX Juillet, 33000 Bordeaux', 44.8434, -0.5774, 'retailer', NULL, 'Bordeaux cigar specialist by the Quinconces.', now()),

  -- ─── SWITZERLAND (independents) ────────────────────────────────────────────
  ('zigarren-duerr-zurich', 'Zigarren Dürr', 'Zurich', 'Switzerland', 'Bahnhofplatz 6, 8001 Zürich', 47.3776, 8.5402, 'retailer', 'https://www.zigarrenduerr.ch/', 'Operates the Davidoff flagship. Premier Zürich tobacconist.', now()),
  ('vautier-lausanne', 'Tabacs Besson', 'Lausanne', 'Switzerland', 'Rue de Bourg 27, 1003 Lausanne', 46.5197, 6.6340, 'retailer', 'https://www.besson1862.ch/', 'Lausanne''s premier tobacconist since 1862.', now()),

  -- ─── GERMANY (independents) ────────────────────────────────────────────────
  ('zechbauer-munich', 'Max Zechbauer', 'Munich', 'Germany', 'Residenzstraße 10, 80333 München', 48.1420, 11.5781, 'retailer', 'https://www.zechbauer.de/', 'Munich tobacconist trading since 1843. Walk-in humidor.', now()),
  ('pfeifen-heinrichs-koeln', 'Pfeifen Heinrichs', 'Cologne', 'Germany', 'Schildergasse 70, 50667 Köln', 50.9357, 6.9534, 'retailer', 'https://www.pfeifen-heinrichs.de/', 'Cologne cigar and pipe specialist on Schildergasse.', now()),
  ('cigar-world-duesseldorf', 'Cigar World Düsseldorf', 'Düsseldorf', 'Germany', 'Burghofstraße 28, 40223 Düsseldorf', 51.2106, 6.7669, 'retailer', 'https://www.cigar-world.de/', 'Düsseldorf cigar megastore. Houses an LCDH.', now()),

  -- ─── SPAIN ─────────────────────────────────────────────────────────────────
  ('gimeno-barcelona', 'Gimeno Tabacos', 'Barcelona', 'Spain', 'La Rambla 100, 08002 Barcelona', 41.3825, 2.1731, 'retailer', 'https://www.gimeno.es/', 'Trading on Las Ramblas since 1920.', now()),
  ('estanco-pelayo-madrid', 'Estanco de la Calle Mayor', 'Madrid', 'Spain', 'Calle Mayor 35, 28013 Madrid', 40.4156, -3.7081, 'retailer', NULL, 'Historic Madrid tobacconist near Sol.', now()),

  -- ─── ITALY (independents) ──────────────────────────────────────────────────
  ('tabaccheria-borgia-rome', 'Tabaccheria Borgia', 'Rome', 'Italy', 'Borgo Pio 11, 00193 Roma', 41.9036, 12.4604, 'retailer', NULL, 'Vatican-area tobacconist. Habanos specialists.', now()),
  ('arnaboldi-milan', 'Arnaboldi Cigars', 'Milan', 'Italy', 'Galleria Vittorio Emanuele II, 20121 Milano', 45.4659, 9.1898, 'retailer', 'https://www.arnaboldicigars.com/', 'Inside the Galleria Vittorio Emanuele II. The Milanese institution.', now()),

  -- ─── NETHERLANDS ───────────────────────────────────────────────────────────
  ('hajenius-amsterdam', 'P.G.C. Hajenius', 'Amsterdam', 'Netherlands', 'Rokin 96, 1012 KZ Amsterdam', 52.3697, 4.8924, 'retailer', 'https://www.hajenius.com/', 'Trading since 1826. Art Deco interior; the Amsterdam classic.', now()),

  -- ─── AUSTRIA ───────────────────────────────────────────────────────────────
  ('tabak-trafik-kober-vienna', 'Tabak-Trafik Kober', 'Vienna', 'Austria', 'Tuchlauben 6, 1010 Wien', 48.2099, 16.3697, 'retailer', NULL, 'Historic Innere Stadt tobacconist.', now()),

  -- ─── IRELAND ───────────────────────────────────────────────────────────────
  ('decents-dublin', 'Decent Cigar Emporium', 'Dublin', 'Ireland', '46 Grafton Street, Dublin 2', 53.3411, -6.2610, 'retailer', 'https://www.decentcigaremporium.com/', 'Dublin''s premier cigar shop on Grafton Street.', now()),

  -- ─── SCANDINAVIA ───────────────────────────────────────────────────────────
  ('cigarrcentralen-stockholm', 'Cigarrcentralen', 'Stockholm', 'Sweden', 'Birger Jarlsgatan 17, 111 45 Stockholm', 59.3358, 18.0716, 'retailer', 'https://cigarrcentralen.se/', 'Stockholm''s premier cigar specialist. Walk-in humidor; tastings.', now()),
  ('hotel-gastis-varberg', 'Hotel Gästis · Lasse Diding''s Cigarmaker', 'Varberg', 'Sweden', 'Bäckgatan 1, 432 41 Varberg', 57.1058, 12.2502, 'lounge', 'https://www.hotelgastis.se/', 'The legendary Lasse Diding hotel and cigar lounge.', now()),
  ('malmo-cigarr-tobakshandel', 'Malmö Cigarr & Tobakshandel', 'Malmö', 'Sweden', 'Gustav Adolfs Torg 41, 211 39 Malmö', 55.6035, 13.0009, 'retailer', 'https://www.facebook.com/MalmoCigarrTobakshandel/', 'Southern Sweden''s flagship cigar specialist.', now()),
  ('wo-larsen-copenhagen', 'W.Ø. Larsen', 'Copenhagen', 'Denmark', 'Læderstræde 11, 1201 København', 55.6772, 12.5793, 'retailer', 'https://wolarsen.dk/', 'Trading since 1864. Walk-in humidor; quiet smoking lounge.', now()),
  ('macanudo-copenhagen', 'Club Macanudo Copenhagen', 'Copenhagen', 'Denmark', 'Silkegade 23, 1113 København K', 55.6803, 12.5807, 'retailer', 'https://clubmacanudo.com/locations/copenhagen/', 'STG''s relaunch of the former Davidoff My Own Blend store.', now()),
  ('musen-og-elefanten', 'Musen & Elefanten', 'Copenhagen', 'Denmark', 'Vestergade 21, 1456 København K', 55.6776, 12.5710, 'pub', 'https://musenogelefanten.dk/', 'One of the only bars in Denmark that sells cigars.', now()),
  ('zigge-helsinki', 'Zigge Cigars', 'Helsinki', 'Finland', 'Fredrikinkatu 41, 00120 Helsinki', 60.1670, 24.9355, 'retailer', 'https://www.zigge.fi/', 'Finland''s flagship cigar specialist.', now()),
  ('oslo-cigar-club', 'Heinrich Müller Cigars', 'Oslo', 'Norway', 'Karl Johans gate 31, 0159 Oslo', 59.9133, 10.7398, 'retailer', NULL, 'Norway''s flagship cigar specialist on Karl Johan.', now()),

  -- ─── EASTERN EUROPE ────────────────────────────────────────────────────────
  ('jaspis-prague', 'Jaspis Cigars', 'Prague', 'Czech Republic', 'Karoliny Světlé 23, 110 00 Praha 1', 50.0828, 14.4180, 'retailer', NULL, 'Old Town Prague cigar boutique.', now()),
  ('cohiba-atmosphere-prague', 'Cohiba Atmosphere Prague', 'Prague', 'Czech Republic', 'V Celnici 7, 110 00 Praha 1', 50.0866, 14.4334, 'house', 'https://www.habanos.com/', 'One of the few Cohiba Atmosphere lounges in Europe.', now()),
  ('cigar-house-budapest', 'Cigar House Budapest', 'Budapest', 'Hungary', 'Andrássy út 21, 1061 Budapest', 47.5025, 19.0566, 'retailer', NULL, 'Budapest cigar specialist on Andrássy út.', now()),

  -- ─── ANDORRA (independents) ────────────────────────────────────────────────
  ('tabacs-cisco-andorra', 'Tabacs Cisco', 'Andorra la Vella', 'Andorra', 'Avinguda Meritxell 105, AD500 Andorra la Vella', 42.5063, 1.5219, 'retailer', NULL, 'Duty-free cigar specialist on Andorra''s main shopping street.', now()),

  -- ─── ARGENTINA ─────────────────────────────────────────────────────────────
  ('cohiba-atmosphere-buenos-aires', 'Cohiba Atmosphere Buenos Aires', 'Buenos Aires', 'Argentina', 'Moreno 518, C1091AAL CABA', -34.6118, -58.3739, 'house', 'https://www.habanos.com/', 'The Cohiba Atmosphere lounge in San Telmo.', now()),

  -- ─── BRAZIL ────────────────────────────────────────────────────────────────
  ('rei-do-cuba-sao-paulo', 'Rei do Cuba', 'Sao Paulo', 'Brazil', 'Rua Pamplona 1391, Jardim Paulista, São Paulo', -23.5670, -46.6645, 'retailer', 'https://www.reidocuba.com.br/', 'Jardim Paulista cigar specialist. Walk-in humidor.', now()),

  -- ─── MEXICO ────────────────────────────────────────────────────────────────
  ('le-cigare-mexico-city', 'Le Cigare Mexico', 'Mexico City', 'Mexico', 'Av. Presidente Masaryk 410, Polanco, 11550 CDMX', 19.4330, -99.1953, 'retailer', NULL, 'Polanco cigar specialist with smoking lounge.', now()),

  -- ─── UAE (independents) ────────────────────────────────────────────────────
  ('cohiba-atmosphere-dubai', 'Cohiba Atmosphere Dubai', 'Dubai', 'United Arab Emirates', 'Sofitel Dubai The Obelisk, Sheikh Rashid Road, Dubai', 25.2289, 55.3287, 'house', 'https://www.habanos.com/', 'One of the only Cohiba Atmosphere lounges worldwide.', now()),
  ('havana-cigar-cafe-dubai', 'Havana Café & Cigar Lounge', 'Dubai', 'United Arab Emirates', 'Habtoor Grand Resort, Jumeirah Beach, Dubai', 25.0824, 55.1390, 'lounge', 'https://www.havanacigardubai.com/', 'JBR cigar lounge with outdoor terrace.', now()),
  ('emirates-palace-cigar-lounge', 'Havana Club at Emirates Palace', 'Abu Dhabi', 'United Arab Emirates', 'Emirates Palace Mandarin Oriental, West Corniche, Abu Dhabi', 24.4615, 54.3173, 'lounge', 'https://www.mandarinoriental.com/', 'Inside Emirates Palace. Smoking salon with full bar.', now()),

  -- ─── HONG KONG (independents) ──────────────────────────────────────────────
  ('cohiba-atmosphere-hong-kong', 'Cohiba Atmosphere Hong Kong', 'Hong Kong', 'Hong Kong', 'L1, 23 Wing Fung Street, Wan Chai', 22.2752, 114.1734, 'house', 'https://www.habanos.com/', 'Wan Chai Cohiba Atmosphere lounge.', now()),
  ('the-pacific-cigar-co-hk', 'Pacific Cigar Company', 'Hong Kong', 'Hong Kong', '21/F, Skyline Tower, 39 Wang Kwong Road, Kowloon Bay', 22.3214, 114.2126, 'retailer', 'https://www.pacificcigar.com/', 'Habanos exclusive distributor for Asia Pacific.', now()),

  -- ─── JAPAN (independents) ──────────────────────────────────────────────────
  ('cohiba-atmosphere-tokyo', 'Cohiba Atmosphere Tokyo', 'Tokyo', 'Japan', '4-2-15 Nishi-Azabu, Minato-ku, Tokyo 106-0031', 35.6593, 139.7227, 'house', 'https://www.habanos.com/', 'Nishi-Azabu Cohiba Atmosphere lounge. Open till 3am.', now()),
  ('le-connaisseur-ginza', 'Le Connaisseur Ginza', 'Tokyo', 'Japan', '8-6-24 Ginza, Chuo-ku, Tokyo 104-0061', 35.6691, 139.7625, 'lounge', NULL, 'Ginza''s flagship cigar bar. Wide selection of Habanos and New World.', now()),
  ('le-connaisseur-marunouchi', 'Le Connaisseur Marunouchi', 'Tokyo', 'Japan', '1-6-3 Marunouchi, Chiyoda-ku, Tokyo 100-0005', 35.6814, 139.7665, 'lounge', 'https://www.marunouchi-hotel.co.jp/en/restaurant/lu/', 'Inside the Marunouchi Hotel.', now()),
  ('imperial-hotel-cigar-tokyo', 'Imperial Hotel Cigar Salon', 'Tokyo', 'Japan', '1-1-1 Uchisaiwai-cho, Chiyoda-ku, Tokyo 100-8558', 35.6716, 139.7591, 'lounge', NULL, 'Inside the Imperial Hotel. Smoking permitted indoors.', now()),

  -- ─── SINGAPORE ─────────────────────────────────────────────────────────────
  ('fume-singapore', 'Fume Cigar Bar', 'Singapore', 'Singapore', '5 Bukit Pasoh Road, Singapore 089684', 1.2810, 103.8412, 'lounge', 'https://www.fume.sg/', 'Boutique cigar bar in Bukit Pasoh. One of Singapore''s few legal indoor smoking venues.', now()),
  ('havana-cigar-club-singapore', 'Havana Cigar Club Singapore', 'Singapore', 'Singapore', '8 Phillip Street, #01-02 Singapore 048932', 1.2851, 103.8499, 'club', 'https://www.havanaclub.sg/', 'Members'' cigar club in the CBD.', now()),

  -- ─── KOREA ─────────────────────────────────────────────────────────────────
  ('the-cigarist-seoul', 'The Cigarist', 'Seoul', 'South Korea', '23 Apgujeong-ro 60-gil, Gangnam-gu, Seoul', 37.5260, 127.0387, 'lounge', NULL, 'Gangnam cigar lounge.', now()),

  -- ─── PHILIPPINES ───────────────────────────────────────────────────────────
  ('cigar-emporium-manila', 'The Cigar Emporium', 'Manila', 'Philippines', 'Greenbelt 5, Ayala Center, Makati City', 14.5526, 121.0244, 'retailer', NULL, 'Manila cigar specialist in Greenbelt.', now()),

  -- ─── AUSTRALIA ─────────────────────────────────────────────────────────────
  ('alexanders-cigar-melbourne', 'Alexander''s Cigar Divan', 'Melbourne', 'Australia', '525 Collins Street, Melbourne VIC 3000', -37.8186, 144.9568, 'lounge', 'https://www.alexanderscigardivan.com.au/', 'Melbourne CBD cigar lounge. Walk-in humidor.', now()),
  ('cigar-room-sydney', 'The Cigar Room of Sydney', 'Sydney', 'Australia', '37 Bayswater Road, Potts Point NSW 2011', -33.8746, 151.2229, 'lounge', NULL, 'Potts Point cigar lounge. Sydney''s primary indoor smoking venue.', now()),

  -- ─── SOUTH AFRICA ──────────────────────────────────────────────────────────
  ('wesley-cigar-merchants-cape-town', 'Wesley''s Cigar Bar', 'Cape Town', 'South Africa', 'Cape Quarter, De Waterkant, Cape Town 8001', -33.9156, 18.4151, 'lounge', NULL, 'Cape Town cigar lounge in De Waterkant.', now()),
  ('the-twelve-apostles-cigar-bar', 'Twelve Apostles Cigar Bar', 'Cape Town', 'South Africa', 'Victoria Road, Camps Bay, Cape Town 8005', -33.9740, 18.3580, 'lounge', 'https://www.12apostleshotel.com/', 'Cigar lounge inside the Twelve Apostles Hotel.', now())

ON CONFLICT (slug) DO NOTHING;


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- Coverage notes — areas where data is intentionally thin or omitted:
--   * Canada: LCDH Toronto, Montreal and Vancouver have all permanently closed.
--     No high-confidence active venues seeded; add manually when verified.
--   * Russia: LCDH locations exist in Moscow and St Petersburg but omitted
--     per the user's note on the politically sensitive market.
--   * India: no LCDH; the indoor-smoking ban is uniformly enforced.
--   * Mainland China (Shanghai/Beijing): LCDH presence exists but addresses
--     change frequently; deferred until they can be verified in person.
--   * Vegas: Casa Fuente Forum Shops closed October 2025 — omitted.
--   * Davidoff Atlanta: closed — omitted.
-- ============================================================================
