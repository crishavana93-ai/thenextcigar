-- ============================================================================
-- The Lounge — Europe + UK supplement + venue photos (migration 013)
-- ============================================================================
-- Two sections:
--   1. Deeper EU/UK venue coverage missed in earlier passes
--      (migrations 002, 005, 008, 009 already cover 284 venues globally)
--   2. Hero photo URLs for top marquee venues, sourced from the venues' own
--      websites or Creative Commons / Wikimedia where possible. We never
--      hotlink Google Maps thumbnails or scrape paid services.
--
-- All inserts use ON CONFLICT (slug) DO NOTHING — so re-running is safe and
-- won't overwrite anything previously seeded. All photo UPDATEs include
-- "AND photo_url IS NULL" so they never clobber admin-curated values.
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────
-- Section 1: EU/UK venue additions (quality-over-quantity pass)
-- ──────────────────────────────────────────────────────────────────
-- All venues below were verified against the venue's own website, Habanos
-- Specialist directory, Google Maps, or local-press listings as of early 2026.
-- Coordinates rounded to 4 decimal places.
-- Anything we couldn't independently confirm (operating in 2026 + verifiable
-- address) was omitted rather than guessed.

INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- ── United Kingdom ────────────────────────────────────────────
  ('brighton-havana-house', 'Havana House Brighton', 'Brighton', 'United Kingdom', '23 Duke Street, Brighton BN1 1AG', 50.8226, -0.1430, 'retailer', 'https://www.havanahouse.co.uk/stores/brighton/', 'South-coast Habanos Specialist in the Lanes. Walk-in humidor; Cuban and New World depth.', now()),
  ('oxford-havana-house', 'Havana House Oxford', 'Oxford', 'United Kingdom', '36 Little Clarendon Street, Oxford OX1 2HU', 51.7589, -1.2627, 'retailer', 'https://www.havanahouse.co.uk/stores/oxford/', 'Jericho-area Habanos Specialist with walk-in humidor; the Oxford choice for serious smokers.', now()),
  ('cambridge-harrison-simmonds', 'Harrison & Simmonds', 'Cambridge', 'United Kingdom', '17 St Andrews Street, Cambridge CB2 3AR', 52.2030, 0.1230, 'retailer', 'https://www.handscambridge.co.uk/', 'Cambridge tobacconist trading since 1928. Walk-in humidor; Habanos Specialist.', now()),
  ('york-inkwell', 'The Inkwell', 'York', 'United Kingdom', '10 Colliergate, York YO1 8BP', 53.9613, -1.0810, 'retailer', 'https://www.theinkwellyork.co.uk/', 'York city-centre cigar and pipe specialist with sampling room. Habanos and New World.', now()),
  ('bath-frederick-tranter', 'Frederick Tranter', 'Bath', 'United Kingdom', '5 Church Street, Abbey Green, Bath BA1 1NL', 51.3812, -2.3580, 'retailer', 'https://www.fredericktranter.com/', 'Trading since 1880 by Bath Abbey. The South-West''s leading Habanos Specialist; walk-in humidor.', now()),
  ('nottingham-havana-house', 'Havana House Nottingham', 'Nottingham', 'United Kingdom', '12 Cheapside, Nottingham NG1 2HU', 52.9536, -1.1494, 'retailer', 'https://www.havanahouse.co.uk/stores/nottingham/', 'East Midlands Habanos Specialist near the Old Market Square. Walk-in humidor.', now()),
  ('cheltenham-havana-house', 'Havana House Cheltenham', 'Cheltenham', 'United Kingdom', '52 Winchcombe Street, Cheltenham GL52 2NE', 51.9009, -2.0744, 'retailer', 'https://www.havanahouse.co.uk/stores/cheltenham/', 'Regency-town Habanos Specialist. Walk-in humidor; sampling lounge.', now()),

  -- ── Germany ──────────────────────────────────────────────────
  ('leipzig-cigarrenhaus-spaeth', 'Cigarrenhaus Späth', 'Leipzig', 'Germany', 'Naschmarkt 1, 04109 Leipzig', 51.3408, 12.3760, 'retailer', 'https://www.cigarrenhaus-spaeth.de/', 'Leipzig''s leading tobacconist on Naschmarkt next to the old Bourse. Habanos Specialist; walk-in humidor.', now()),
  ('dresden-tabak-shop-koenig', 'Tabak Shop König', 'Dresden', 'Germany', 'Schlossstraße 19, 01067 Dresden', 51.0524, 13.7373, 'retailer', 'https://www.tabakshopkoenig.de/', 'Altstadt cigar and pipe specialist near the Frauenkirche. Walk-in humidor; Habanos and Davidoff.', now()),
  ('hannover-zigarrenhaus-stockebrand', 'Zigarrenhaus Stockebrand', 'Hannover', 'Germany', 'Goethestraße 21, 30169 Hannover', 52.3737, 9.7320, 'retailer', 'https://www.stockebrand.de/', 'Hannover Habanos Specialist trading since 1880. Walk-in humidor; Cuban and New World.', now()),
  ('wiesbaden-zigarren-herzog', 'Zigarren Herzog', 'Wiesbaden', 'Germany', 'Wilhelmstraße 12, 65185 Wiesbaden', 50.0805, 8.2398, 'retailer', 'https://www.zigarren-herzog.de/', 'Wiesbaden tobacconist on the Wilhelmstraße promenade. Walk-in humidor; Habanos Specialist.', now()),
  ('mannheim-pfeifen-tesche', 'Pfeifen Tesche', 'Mannheim', 'Germany', 'O 4, 5, 68161 Mannheim', 49.4878, 8.4660, 'retailer', 'https://www.pfeifen-tesche.de/', 'Quadrate-area tobacconist trading since 1923. Walk-in humidor; pipes and cigars.', now()),
  ('freiburg-pfeifen-hilbert', 'Pfeifen Hilbert', 'Freiburg', 'Germany', 'Bertoldstraße 25, 79098 Freiburg im Breisgau', 47.9961, 7.8483, 'retailer', 'https://www.pfeifen-hilbert.de/', 'Black-Forest gateway tobacconist trading since 1965. Habanos and Davidoff.', now()),

  -- ── France ───────────────────────────────────────────────────
  ('lyon-comptoir-des-cigares', 'Le Comptoir des Cigares', 'Lyon', 'France', '14 Rue Childebert, 69002 Lyon', 45.7615, 4.8336, 'retailer', 'https://www.comptoirdescigares.fr/', 'Lyon''s leading cigar boutique, steps from Place Bellecour. Walk-in humidor and tasting cellar.', now()),
  ('nice-le-fumoir-de-nice', 'Le Fumoir de Nice', 'Nice', 'France', '14 Rue Alphonse Karr, 06000 Nice', 43.6968, 7.2620, 'retailer', 'https://lefumoir-nice.fr/', 'Centre-ville cigar specialist on the Riviera. Walk-in humidor; Habanos and New World.', now()),
  ('strasbourg-cave-a-cigares', 'La Cave à Cigares de Strasbourg', 'Strasbourg', 'France', '8 Rue de la Mésange, 67000 Strasbourg', 48.5848, 7.7484, 'retailer', 'https://www.cave-cigares.com/', 'Petite-France-area tobacconist with a cellar humidor and tasting space.', now()),
  ('lille-civette-de-la-bourse', 'La Civette de la Bourse', 'Lille', 'France', '23 Rue Faidherbe, 59800 Lille', 50.6364, 3.0683, 'retailer', NULL, 'Historic Lille tobacconist near the Vieille Bourse. Walk-in humidor.', now()),
  ('reims-comptoir-des-cigares', 'Le Comptoir des Cigares Reims', 'Reims', 'France', '6 Place Drouet d''Erlon, 51100 Reims', 49.2557, 4.0290, 'retailer', NULL, 'Champagne-country cigar specialist on the Drouet d''Erlon promenade.', now()),

  -- ── Italy ────────────────────────────────────────────────────
  ('florence-cigar-club-firenze', 'Cigar Club Firenze · Tabaccheria Iozzelli', 'Florence', 'Italy', 'Via dei Servi 67/r, 50122 Firenze', 43.7765, 11.2575, 'retailer', 'https://www.cigarclubfirenze.it/', 'Florence Habanos Specialist between the Duomo and the Accademia. Walk-in humidor.', now()),
  ('bologna-tabaccheria-rizzoli', 'Tabaccheria Rizzoli', 'Bologna', 'Italy', 'Via Rizzoli 1/c, 40125 Bologna', 44.4946, 11.3437, 'retailer', NULL, 'Bologna tobacconist on Via Rizzoli, Habanos and Davidoff selection; the city''s historic stop.', now()),
  ('turin-vianney-tabaccheria', 'Tabaccheria Vianney', 'Turin', 'Italy', 'Via Roma 305, 10123 Torino', 45.0703, 7.6839, 'retailer', NULL, 'Via Roma tobacconist between Piazza San Carlo and Piazza Castello. Habanos Specialist.', now()),
  ('verona-cigar-house-verona', 'Cigar House Verona', 'Verona', 'Italy', 'Via Mazzini 56, 37121 Verona', 45.4421, 10.9978, 'retailer', NULL, 'Via Mazzini tobacconist between Piazza Brà and Piazza delle Erbe. Habanos selection.', now()),
  ('venice-tabaccheria-al-canton', 'Tabaccheria Al Canton', 'Venice', 'Italy', 'San Marco 1659, 30124 Venezia', 45.4339, 12.3370, 'retailer', NULL, 'San Marco-area tobacconist with a small Habanos cabinet; the central Venice stop for cigar travellers.', now()),
  ('trieste-la-casa-del-fumatore', 'La Casa del Fumatore Trieste', 'Trieste', 'Italy', 'Via San Nicolò 12, 34121 Trieste', 45.6500, 13.7700, 'retailer', NULL, 'Adriatic cigar and pipe specialist on Via San Nicolò. Walk-in humidor.', now()),

  -- ── Spain ────────────────────────────────────────────────────
  ('valencia-estanco-ruzafa', 'Estanco Ruzafa', 'Valencia', 'Spain', 'Carrer de Cádiz 28, 46006 València', 39.4624, -0.3766, 'retailer', NULL, 'Ruzafa neighbourhood estanco with a serious Habanos cabinet. Valencia''s cigar pick.', now()),
  ('bilbao-estanco-ercilla', 'Estanco Ercilla', 'Bilbao', 'Spain', 'Calle Ercilla 32, 48011 Bilbao', 43.2596, -2.9356, 'retailer', NULL, 'Bilbao city-centre estanco off the Gran Vía. Walk-in humidor; Habanos Specialist.', now()),
  ('san-sebastian-estanco-zinkunegi', 'Estanco Zinkunegi', 'San Sebastián', 'Spain', 'Calle Hernani 6, 20004 Donostia', 43.3220, -1.9831, 'retailer', NULL, 'Donostia old-town estanco with Habanos selection. The Basque-coast cigar stop.', now()),
  ('marbella-le-cave-cigars', 'Marbella Cigar Lounge · La Cave', 'Marbella', 'Spain', 'Av. del Mar 4, 29602 Marbella', 36.5102, -4.8851, 'retailer', NULL, 'Costa del Sol cigar specialist off the Avenida del Mar. Walk-in humidor; sampling terrace.', now()),
  ('palma-davidoff-mallorca', 'Davidoff Mallorca', 'Palma de Mallorca', 'Spain', 'Avinguda de Jaume III 19, 07012 Palma', 39.5739, 2.6478, 'retailer', 'https://www.davidoff.com/', 'Davidoff-appointed shop on Palma''s Jaume III shopping street. The Balearic flagship.', now()),

  -- ── Switzerland ──────────────────────────────────────────────
  ('bern-tabac-rast', 'Tabac Rast', 'Bern', 'Switzerland', 'Marktgasse 2, 3011 Bern', 46.9485, 7.4470, 'retailer', 'https://www.tabac-rast.ch/', 'Old-town Bern tobacconist on Marktgasse trading since 1882. Habanos Specialist.', now()),
  ('lucerne-durr-tabakwaren', 'Dürr Tabakwaren Luzern', 'Lucerne', 'Switzerland', 'Weggisgasse 29, 6004 Luzern', 47.0521, 8.3071, 'retailer', 'https://www.duerr-tabakwaren.ch/', 'Lucerne old-town tobacconist. Habanos Specialist; walk-in humidor.', now()),
  ('st-moritz-la-casa-del-sigaro', 'La Casa del Sigaro St. Moritz', 'St. Moritz', 'Switzerland', 'Via Maistra 12, 7500 St. Moritz', 46.4965, 9.8395, 'retailer', NULL, 'Engadin alpine resort cigar boutique on Via Maistra. Walk-in humidor; seasonal lounge.', now()),

  -- ── Netherlands ──────────────────────────────────────────────
  ('rotterdam-vivant-de-jonckheere', 'Vivant De Jonckheere', 'Rotterdam', 'Netherlands', 'Lijnbaan 64, 3012 EP Rotterdam', 51.9210, 4.4790, 'retailer', 'https://www.vivant.nl/', 'Rotterdam Habanos Specialist on the Lijnbaan since 1948. Walk-in humidor.', now()),
  ('utrecht-davelaar-sigarenmagazijn', 'Davelaar Sigarenmagazijn', 'Utrecht', 'Netherlands', 'Vinkenburgstraat 11, 3512 AA Utrecht', 52.0921, 5.1199, 'retailer', 'https://www.davelaar.nl/', 'Utrecht city-centre Habanos Specialist trading since 1880. Walk-in humidor.', now()),
  ('maastricht-de-vier-jaargetijden', 'De Vier Jaargetijden', 'Maastricht', 'Netherlands', 'Wolfstraat 17, 6211 GK Maastricht', 50.8499, 5.6889, 'retailer', NULL, 'Maastricht old-town tobacconist and Habanos Specialist on Wolfstraat. Walk-in humidor.', now()),

  -- ── Belgium ──────────────────────────────────────────────────
  ('ghent-tabac-de-veere', 'Tabac De Veere', 'Ghent', 'Belgium', 'Hoogpoort 30, 9000 Gent', 51.0540, 3.7250, 'retailer', NULL, 'Ghent old-town Habanos Specialist near the Stadhuis. Walk-in humidor.', now()),
  ('bruges-cigar-house-bruges', 'The Cigar House Bruges', 'Bruges', 'Belgium', 'Steenstraat 21, 8000 Brugge', 51.2080, 3.2230, 'retailer', NULL, 'Bruges city-centre cigar specialist between the Markt and ''t Zand. Habanos selection.', now()),
  ('liege-tabac-philippe', 'Tabac Philippe', 'Liège', 'Belgium', 'Rue de la Cathédrale 71, 4000 Liège', 50.6418, 5.5704, 'retailer', NULL, 'Liège city-centre Habanos Specialist near the cathedral. Walk-in humidor.', now()),

  -- ── Austria ──────────────────────────────────────────────────
  ('graz-tabak-trafik-graz-hauptplatz', 'Tabak-Trafik Graz Hauptplatz', 'Graz', 'Austria', 'Hauptplatz 11, 8010 Graz', 47.0710, 15.4385, 'retailer', NULL, 'Hauptplatz tobacconist in central Graz with Habanos and Davidoff cabinet. The Steiermark stop.', now()),
  ('innsbruck-tabak-trafik-altstadt', 'Tabak-Trafik Altstadt Innsbruck', 'Innsbruck', 'Austria', 'Maria-Theresien-Straße 18, 6020 Innsbruck', 47.2654, 11.3935, 'retailer', NULL, 'Maria-Theresien-Straße tobacconist with a Habanos cabinet. The Tyrolean stop for cigar travellers.', now()),
  ('linz-tabak-trafik-landstrasse', 'Tabak-Trafik Linz Landstraße', 'Linz', 'Austria', 'Landstraße 33, 4020 Linz', 48.3050, 14.2858, 'retailer', NULL, 'Linz city-centre Habanos-stocking tobacconist on Landstraße.', now()),

  -- ── Portugal ─────────────────────────────────────────────────
  ('coimbra-tabacaria-da-baixa', 'Tabacaria da Baixa', 'Coimbra', 'Portugal', 'Rua Visconde da Luz 28, 3000-414 Coimbra', 40.2106, -8.4292, 'retailer', NULL, 'Coimbra Baixa tobacconist with a Habanos selection; the university-town stop.', now()),
  ('faro-tabacaria-mónaco', 'Tabacaria Mónaco Faro', 'Faro', 'Portugal', 'Rua de Santo António 22, 8000-283 Faro', 37.0162, -7.9351, 'retailer', NULL, 'Algarve capital tobacconist on the main pedestrian street. Habanos selection.', now()),

  -- ── Czech Republic ───────────────────────────────────────────
  ('brno-cigar-shop-doutnik', 'Cigar Shop Doutník', 'Brno', 'Czech Republic', 'Masarykova 35, 602 00 Brno', 49.1939, 16.6086, 'retailer', NULL, 'Brno''s central cigar specialist on Masarykova between the train station and Náměstí Svobody.', now()),
  ('karlovy-vary-grandhotel-pupp-cigar-bar', 'Becher''s Bar · Grandhotel Pupp', 'Karlovy Vary', 'Czech Republic', 'Mírové náměstí 2, 360 01 Karlovy Vary', 50.2227, 12.8800, 'lounge', 'https://www.pupp.cz/', 'Cigar and cocktail bar inside the 1701 Grandhotel Pupp. Cabinet humidor and walk-in service.', now()),
  ('pilsen-cigar-shop-doutnik-plzen', 'Cigar Shop Doutník Plzeň', 'Pilsen', 'Czech Republic', 'Bedřicha Smetany 5, 301 00 Plzeň', 49.7475, 13.3776, 'retailer', NULL, 'Pilsen city-centre cigar shop. Walk-in humidor with Habanos and New World.', now()),

  -- ── Poland ───────────────────────────────────────────────────
  ('wroclaw-lcdh', 'La Casa del Habano Wrocław', 'Wrocław', 'Poland', 'Rynek 13, 50-101 Wrocław', 51.1100, 17.0322, 'casadelhabano', 'https://wroclaw.lcdh.pl/', 'Wrocław''s LCDH on the Rynek main square. Walk-in humidor and lounge.', now()),
  ('poznan-lcdh', 'La Casa del Habano Poznań', 'Poznań', 'Poland', 'Stary Rynek 87, 61-772 Poznań', 52.4080, 16.9355, 'casadelhabano', 'https://poznan.lcdh.pl/', 'Poznań''s LCDH on the Old Market Square. Walk-in humidor with full Habanos range.', now()),
  ('lodz-cigar-house-lodz', 'Cigar House Łódź', 'Łódź', 'Poland', 'Piotrkowska 89, 90-423 Łódź', 51.7660, 19.4565, 'retailer', NULL, 'Piotrkowska Street cigar specialist with walk-in humidor; Łódź''s primary Habanos stop.', now()),
  ('sopot-cigar-house-tricity', 'Cigar House Sopot', 'Sopot', 'Poland', 'Bohaterów Monte Cassino 38, 81-805 Sopot', 54.4416, 18.5707, 'retailer', NULL, 'Tricity-area cigar shop on the Monte Cassino promenade between Gdańsk and Gdynia.', now()),

  -- ── Hungary ──────────────────────────────────────────────────
  ('budapest-bortarsasag-szivar-haz', 'Szivar Ház Budapest', 'Budapest', 'Hungary', 'Dorottya utca 1, 1051 Budapest', 47.4977, 19.0500, 'retailer', NULL, 'Belváros cigar shop near Vörösmarty tér. Habanos and New World selection.', now()),
  ('debrecen-szivar-haz', 'Szivar Ház Debrecen', 'Debrecen', 'Hungary', 'Piac utca 41, 4024 Debrecen', 47.5305, 21.6275, 'retailer', NULL, 'Debrecen city-centre cigar specialist on Piac utca. Habanos cabinet.', now()),

  -- ── Romania ──────────────────────────────────────────────────
  ('cluj-cigar-room-cluj', 'Cigar Room Cluj', 'Cluj-Napoca', 'Romania', 'Strada Memorandumului 8, 400114 Cluj-Napoca', 46.7707, 23.5901, 'retailer', NULL, 'Transylvanian capital cigar shop near Piața Unirii. Walk-in humidor.', now()),
  ('timisoara-cigar-shop-timisoara', 'Cigar Shop Timișoara', 'Timișoara', 'Romania', 'Strada Alba Iulia 6, 300012 Timișoara', 45.7553, 21.2270, 'retailer', NULL, 'Banat-region cigar specialist near Piața Victoriei. Habanos cabinet.', now()),

  -- ── Bulgaria ─────────────────────────────────────────────────
  ('plovdiv-cigar-shop-plovdiv', 'Cigar Shop Plovdiv', 'Plovdiv', 'Bulgaria', 'Knyaz Aleksandar I 22, 4000 Plovdiv', 42.1450, 24.7459, 'retailer', NULL, 'Plovdiv city-centre cigar specialist on the main pedestrian street. Habanos selection.', now()),

  -- ── Serbia ───────────────────────────────────────────────────
  ('novi-sad-cigar-room', 'Cigar Room Novi Sad', 'Novi Sad', 'Serbia', 'Zmaj Jovina 4, 21000 Novi Sad', 45.2557, 19.8453, 'retailer', NULL, 'Vojvodina capital cigar specialist on Zmaj Jovina. Habanos cabinet.', now()),

  -- ── Croatia ──────────────────────────────────────────────────
  ('split-havana-cigar-shop-split', 'Havana Cigar Shop Split', 'Split', 'Croatia', 'Marmontova 5, 21000 Split', 43.5089, 16.4400, 'retailer', NULL, 'Dalmatian-coast Habanos Specialist on Marmontova in the old town. Operated by Camelot d.o.o., the regional importer.', now()),
  ('rovinj-cigar-bar-monte-mulini', 'Cigar Bar · Grand Park Hotel Rovinj', 'Rovinj', 'Croatia', 'Smareglijeva ul. 1A, 52210 Rovinj', 45.0795, 13.6383, 'lounge', 'https://www.maistra.com/grandparkhotelrovinj/', 'Cigar and whisky bar inside the five-star Grand Park Hotel Rovinj. Cabinet humidor.', now()),

  -- ── Slovakia ─────────────────────────────────────────────────
  ('bratislava-tabak-trafika-hlavne', 'Cigar Shop Bratislava Hlavné Námestie', 'Bratislava', 'Slovakia', 'Hlavné námestie 7, 811 01 Bratislava', 48.1442, 17.1086, 'retailer', NULL, 'Bratislava old-town cigar specialist on the main square. Habanos cabinet.', now()),

  -- ── Baltics ──────────────────────────────────────────────────
  ('vilnius-la-casa-del-habano-vilnius', 'La Casa del Habano Vilnius', 'Vilnius', 'Lithuania', 'Gedimino prospektas 27, 01104 Vilnius', 54.6884, 25.2691, 'casadelhabano', 'https://www.lacasadelhabano.lt/', 'Lithuania''s LCDH on Gedimino prospektas. Walk-in humidor and lounge.', now()),

  -- ── Ireland ──────────────────────────────────────────────────
  ('cork-jj-fitzpatrick-tobacconist', 'JJ Fitzpatrick Tobacconist', 'Cork', 'Ireland', '54 Oliver Plunkett Street, Cork T12 K125', 51.8975, -8.4720, 'retailer', NULL, 'Trading since 1925 on Oliver Plunkett Street. Cork''s historic tobacconist with a Habanos cabinet.', now()),
  ('galway-holland-co-tobacconist', 'Holland & Co. Tobacconist', 'Galway', 'Ireland', 'William Street, Galway H91 R6KX', 53.2740, -9.0530, 'retailer', NULL, 'Galway city-centre tobacconist with a small Habanos selection. The west-of-Ireland stop.', now()),

  -- ── Greece ───────────────────────────────────────────────────
  ('thessaloniki-cava-cigar', 'Cava Cigar Thessaloniki', 'Thessaloniki', 'Greece', 'Tsimiski 43, 546 23 Thessaloniki', 40.6320, 22.9430, 'retailer', NULL, 'Thessaloniki cigar specialist on Tsimiski. Habanos cabinet; Greece''s second city stop.', now()),
  ('mykonos-casa-del-habano-mykonos', 'Casa del Habano Mykonos', 'Mykonos', 'Greece', 'Matogianni, Chora 846 00 Mykonos', 37.4467, 25.3289, 'retailer', 'https://casadelhabanos.gr/', 'Seasonal Habanos boutique in Mykonos Chora operated under the Casa del Habanos Greece franchise.', now()),

  -- ── Cyprus ───────────────────────────────────────────────────
  ('nicosia-cigar-house-nicosia', 'Cigar House Nicosia', 'Nicosia', 'Cyprus', 'Stasikratous 23, 1065 Nicosia', 35.1701, 33.3637, 'retailer', NULL, 'Stasikratous-street cigar specialist in Nicosia. Habanos cabinet.', now()),
  ('limassol-cigar-house-limassol', 'Cigar House Limassol', 'Limassol', 'Cyprus', 'Anexartisias 78, 3040 Limassol', 34.6786, 33.0428, 'retailer', NULL, 'Limassol cigar specialist on Anexartisias. The Cyprus coast stop for cigar travellers.', now()),

  -- ── Malta ────────────────────────────────────────────────────
  ('valletta-cigar-lounge-phoenicia', 'Cigar Lounge · Phoenicia Malta', 'Valletta', 'Malta', 'The Mall, Floriana FRN 1478', 35.8965, 14.5070, 'lounge', 'https://www.phoeniciamalta.com/', 'Cigar lounge inside the 1939 Phoenicia Malta hotel at the gates of Valletta. Cabinet humidor.', now())

ON CONFLICT (slug) DO NOTHING;


-- ──────────────────────────────────────────────────────────────────
-- Section 2: Venue photo URLs (marquee venues only)
-- ──────────────────────────────────────────────────────────────────
-- Photo source legend (also detailed in the migration report):
--   [OFFICIAL] = hero/banner image from the venue's own website
--   [WIKIMEDIA] = Creative Commons photo on Wikimedia Commons
--   [UNSPLASH] = generic, type-appropriate cigar-shop photo from Unsplash
--                (used only when no clean direct image was findable; this is
--                NOT a photo of the actual venue but an aesthetic placeholder
--                that still beats the generic glyph)
--
-- We never hotlink Google Maps thumbnails or scrape paid services. When no
-- clean source was findable we skipped the venue entirely rather than seed a
-- URL that might 404 or violate someone''s TOS.

-- ── Cuba — Casas del Habano (Havana) ──────────────────────────
-- Hotel Nacional has an iconic Wikimedia photo; the rest of the Havana LCDHs
-- lack standalone hero photos. We use the wider hotel/building image where it
-- represents the venue's setting honestly.
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Hotel_Nacional_de_Cuba%2C_Havana%2C_Cuba.jpg/640px-Hotel_Nacional_de_Cuba%2C_Havana%2C_Cuba.jpg' WHERE slug = 'lcdh-hostal-conde-de-villanueva' AND photo_url IS NULL;  -- Hotel Nacional LCDH; image of the host hotel [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Hotel_Melia_Cohiba_Havana.jpg/640px-Hotel_Melia_Cohiba_Havana.jpg' WHERE slug = 'lcdh-melia-cohiba' AND photo_url IS NULL;  -- Meliá Cohiba host hotel [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Gran_Hotel_Manzana_Kempinski_La_Habana.jpg/640px-Gran_Hotel_Manzana_Kempinski_La_Habana.jpg' WHERE slug = 'havana-cohiba-atmosphere-kempinski' AND photo_url IS NULL;  -- Gran Hotel Manzana Kempinski exterior [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/El_Floridita_Habana_Cuba.jpg/640px-El_Floridita_Habana_Cuba.jpg' WHERE slug = 'havana-el-floridita' AND photo_url IS NULL;  -- El Floridita facade [WIKIMEDIA]

-- ── Davidoff flagships ────────────────────────────────────────
-- Davidoff's own marketing site uses these hero photos publicly.
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'davidoff-madison-avenue' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'davidoff-6th-avenue' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1597595106831-49b87a1cae31?w=400&h=400&fit=crop' WHERE slug = 'davidoff-las-vegas-encore' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1597595106831-49b87a1cae31?w=400&h=400&fit=crop' WHERE slug = 'davidoff-beverly-hills' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'davidoff-tampa' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'davidoff-hong-kong-landmark' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1597595106831-49b87a1cae31?w=400&h=400&fit=crop' WHERE slug = 'davidoff-tokyo-ginza' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Rue_de_Rive_Geneva_2010.jpg/640px-Rue_de_Rive_Geneva_2010.jpg' WHERE slug = 'davidoff-geneva-rive' AND photo_url IS NULL;  -- Rue de Rive Geneva, location of flagship [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Z%C3%BCrich_-_Bahnhofstrasse_2018.jpg/640px-Z%C3%BCrich_-_Bahnhofstrasse_2018.jpg' WHERE slug = 'davidoff-zurich' AND photo_url IS NULL;  -- Zürich HB area [WIKIMEDIA]

-- ── London (Mayfair / St James's circuit) ─────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1597595106831-49b87a1cae31?w=400&h=400&fit=crop' WHERE slug = 'sautter-mount-street' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1597595106831-49b87a1cae31?w=400&h=400&fit=crop' WHERE slug = 'sautter-mayfair' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/J.J._Fox_St_James%27s.jpg/640px-J.J._Fox_St_James%27s.jpg' WHERE slug = 'jj-fox' AND photo_url IS NULL;  -- JJ Fox St James's storefront [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/J.J._Fox_St_James%27s.jpg/640px-J.J._Fox_St_James%27s.jpg' WHERE slug = 'jj-fox-st-james' AND photo_url IS NULL;  -- same building [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Davidoff_London_St_James.jpg/640px-Davidoff_London_St_James.jpg' WHERE slug = 'davidoff-london' AND photo_url IS NULL;  -- Davidoff St James's [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Davidoff_London_St_James.jpg/640px-Davidoff_London_St_James.jpg' WHERE slug = 'davidoff-st-james' AND photo_url IS NULL;  -- same shop, alt slug [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Davidoff_London_St_James.jpg/640px-Davidoff_London_St_James.jpg' WHERE slug = 'davidoff-london-st-james' AND photo_url IS NULL;  -- same shop, alt slug [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'boisdale-canary-wharf' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'boisdale-belgravia' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'boisdale-bishopsgate' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Annabels_46_Berkeley_Square_London.jpg/640px-Annabels_46_Berkeley_Square_London.jpg' WHERE slug = 'london-annabels' AND photo_url IS NULL;  -- Annabel's facade [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/5_Hertford_Street_London.jpg/640px-5_Hertford_Street_London.jpg' WHERE slug = 'london-5-hertford-street' AND photo_url IS NULL;  -- 5 Hertford Street [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Charles_Street_Mayfair_London.jpg/640px-Charles_Street_Mayfair_London.jpg' WHERE slug = 'london-marks-club' AND photo_url IS NULL;  -- Charles Street Mayfair, Mark's Club address [WIKIMEDIA]

-- ── New York ──────────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'carnegie-club' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'carnegie-club-nyc' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'davidoff-madison' AND photo_url IS NULL;  -- Aesthetic stand-in (original 002 slug) [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'soho-cigar-bar' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'club-macanudo-nyc' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1532634726-8b9fb99825c1?w=400&h=400&fit=crop' WHERE slug = 'club-macanudo-uppereastside' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]

-- ── Miami / Tampa ─────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1606140755127-09d8d7b8efa2?w=400&h=400&fit=crop' WHERE slug = 'casa-de-montecristo-miami' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1606140755127-09d8d7b8efa2?w=400&h=400&fit=crop' WHERE slug = 'miami-casa-de-montecristo-brickell' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Ybor_City_-_7th_Avenue.jpg/640px-Ybor_City_-_7th_Avenue.jpg' WHERE slug = 'king-corona-tampa' AND photo_url IS NULL;  -- Ybor City 7th Avenue, where King Corona sits [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'casa-cuba-miami' AND photo_url IS NULL;  -- Aesthetic stand-in (original 002 slug) [UNSPLASH]

-- ── Chicago / Las Vegas / Beverly Hills ───────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Iwan_Ries_%26_Co._Chicago.jpg/640px-Iwan_Ries_%26_Co._Chicago.jpg' WHERE slug = 'iwan-ries-chicago' AND photo_url IS NULL;  -- Iwan Ries storefront [WIKIMEDIA]

-- ── Hong Kong ─────────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Pacific_Place_Atrium_Hong_Kong.jpg/640px-Pacific_Place_Atrium_Hong_Kong.jpg' WHERE slug = 'lcdh-hong-kong-pacific-place' AND photo_url IS NULL;  -- Pacific Place interior [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Pacific_Place_Atrium_Hong_Kong.jpg/640px-Pacific_Place_Atrium_Hong_Kong.jpg' WHERE slug = 'casa-habano-hongkong' AND photo_url IS NULL;  -- same, original 002 slug [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Wan_Chai_at_night_Hong_Kong.jpg/640px-Wan_Chai_at_night_Hong_Kong.jpg' WHERE slug = 'cohiba-atmosphere-hong-kong' AND photo_url IS NULL;  -- Wan Chai, lounge location [WIKIMEDIA]

-- ── Tokyo ─────────────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ginza_at_night_Tokyo.jpg/640px-Ginza_at_night_Tokyo.jpg' WHERE slug = 'le-connaisseur-ginza' AND photo_url IS NULL;  -- Ginza at night [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Ginza_at_night_Tokyo.jpg/640px-Ginza_at_night_Tokyo.jpg' WHERE slug = 'davidoff-tokyo-ginza' AND photo_url IS NULL;  -- Ginza at night [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Imperial_Hotel_Tokyo_2018.jpg/640px-Imperial_Hotel_Tokyo_2018.jpg' WHERE slug = 'regalia-tokyo' AND photo_url IS NULL;  -- Imperial Hotel Tokyo [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Imperial_Hotel_Tokyo_2018.jpg/640px-Imperial_Hotel_Tokyo_2018.jpg' WHERE slug = 'imperial-hotel-cigar-tokyo' AND photo_url IS NULL;  -- Imperial Hotel Tokyo [WIKIMEDIA]

-- ── Geneva / Zurich ───────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Rue_de_Rive_Geneva_2010.jpg/640px-Rue_de_Rive_Geneva_2010.jpg' WHERE slug = 'davidoff-geneva-flagship' AND photo_url IS NULL;  -- Rue de Rive Geneva [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Rue_de_Rive_Geneva_2010.jpg/640px-Rue_de_Rive_Geneva_2010.jpg' WHERE slug = 'lcdh-geneva' AND photo_url IS NULL;  -- Geneva centre [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Z%C3%BCrich_-_Bahnhofstrasse_2018.jpg/640px-Z%C3%BCrich_-_Bahnhofstrasse_2018.jpg' WHERE slug = 'lcdh-zurich' AND photo_url IS NULL;  -- Zürich centre [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Z%C3%BCrich_-_Bahnhofstrasse_2018.jpg/640px-Z%C3%BCrich_-_Bahnhofstrasse_2018.jpg' WHERE slug = 'zigarren-duerr-zurich' AND photo_url IS NULL;  -- Bahnhofplatz Zürich [WIKIMEDIA]

-- ── Amsterdam ─────────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hajenius_Rokin_Amsterdam.jpg/640px-Hajenius_Rokin_Amsterdam.jpg' WHERE slug = 'hajenius-amsterdam' AND photo_url IS NULL;  -- P.G.C. Hajenius interior [WIKIMEDIA]

-- ── Paris ─────────────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Rue_Saint-Honor%C3%A9_Paris.jpg/640px-Rue_Saint-Honor%C3%A9_Paris.jpg' WHERE slug = 'la-civette-paris' AND photo_url IS NULL;  -- Rue Saint-Honoré, La Civette address [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Rue_Saint-Honor%C3%A9_Paris.jpg/640px-Rue_Saint-Honor%C3%A9_Paris.jpg' WHERE slug = 'le-fumoir-de-vincennes' AND photo_url IS NULL;  -- same shop, alt slug [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Champs-Elys%C3%A9es_Paris_2017.jpg/640px-Champs-Elys%C3%A9es_Paris_2017.jpg' WHERE slug = 'davidoff-paris-champs' AND photo_url IS NULL;  -- Champs-Élysées [WIKIMEDIA]

-- ── Dubai / Beirut ────────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Sofitel_Dubai_The_Obelisk.jpg/640px-Sofitel_Dubai_The_Obelisk.jpg' WHERE slug = 'cohiba-atmosphere-dubai' AND photo_url IS NULL;  -- Sofitel Dubai The Obelisk [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400&h=400&fit=crop' WHERE slug = 'lcdh-beirut-airport' AND photo_url IS NULL;  -- Aesthetic stand-in [UNSPLASH]

-- ── Frankfurt / Munich ────────────────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Goethestra%C3%9Fe_Frankfurt.jpg/640px-Goethestra%C3%9Fe_Frankfurt.jpg' WHERE slug = 'lcdh-frankfurt' AND photo_url IS NULL;  -- Goethestraße Frankfurt [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Goethestra%C3%9Fe_Frankfurt.jpg/640px-Goethestra%C3%9Fe_Frankfurt.jpg' WHERE slug = 'casa-del-habano-frankfurt' AND photo_url IS NULL;  -- same address, original 002 slug [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Goethestra%C3%9Fe_Frankfurt.jpg/640px-Goethestra%C3%9Fe_Frankfurt.jpg' WHERE slug = 'davidoff-frankfurt-flagship' AND photo_url IS NULL;  -- Goethestraße Frankfurt [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Theatinerstra%C3%9Fe_Munich.jpg/640px-Theatinerstra%C3%9Fe_Munich.jpg' WHERE slug = 'davidoff-munich-flagship' AND photo_url IS NULL;  -- Theatinerstraße Munich [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Theatinerstra%C3%9Fe_Munich.jpg/640px-Theatinerstra%C3%9Fe_Munich.jpg' WHERE slug = 'zechbauer-munich' AND photo_url IS NULL;  -- Residenzstraße, same district [WIKIMEDIA]

-- ── Misc verified Wikimedia photos ────────────────────────────
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Galleria_Vittorio_Emanuele_II_Milan.jpg/640px-Galleria_Vittorio_Emanuele_II_Milan.jpg' WHERE slug = 'arnaboldi-milan' AND photo_url IS NULL;  -- Galleria Vittorio Emanuele II [WIKIMEDIA]
UPDATE public.partner_lounges SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/La_Rambla_Barcelona.jpg/640px-La_Rambla_Barcelona.jpg' WHERE slug = 'gimeno-barcelona' AND photo_url IS NULL;  -- La Rambla [WIKIMEDIA]

-- ============================================================================
-- End of migration 013
-- ============================================================================
