-- ============================================================================
-- The Lounge — Sweden + Nordics venue supplement (migration 008)
-- ============================================================================
-- Adds venues that the global pass (migration 005) missed for the Nordic
-- region — primarily Sweden — where local knowledge revealed gaps. Sources:
--   - Habanos S.A. / Habanos Nordic dealer locator
--   - La Casa del Habano locator (lacasadelhabano.com)
--   - Cigar Journal regional features (Stockholm/Malmö/Gothenburg/Oslo)
--   - Cigar Aficionado venue articles
--   - Member input (Malmö user flagged MCS and other Skåne venues)
--   - Google Maps / hitta.se / proff.no / krak.dk verification of street,
--     postcode and coordinates
--
-- Conventions match migration 005:
--   - All venues verified_at = now() so they appear on the map immediately.
--   - Coordinates verified to 4 decimal places against Google Maps / hitta.se.
--   - Permanently closed venues OMITTED — notably Mellgren's Fine Tobacco
--     (Gothenburg, bankrupt Oct 2022) which still appears in older listicles.
--   - Slugs are stable, kebab-case, globally unique, city-prefixed where
--     useful to avoid collisions with global migrations.
--   - ON CONFLICT (slug) DO NOTHING — safe to re-run; existing rows from
--     migrations 002 and 005 are preserved (cigarrcentralen-stockholm,
--     malmo-cigarr-tobakshandel, hotel-gastis-varberg, wo-larsen-copenhagen,
--     macanudo-copenhagen, musen-og-elefanten, zigge-helsinki,
--     oslo-cigar-club, etc).
--   - Sweden's tobacco law is strict: most "lounges" are private members
--     clubs or back rooms in shops — perks text reflects that honestly.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- SWEDEN
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Stockholm
  ('stockholm-cigarrummet', 'Cigarrummet', 'Stockholm', 'Sweden', 'Birger Jarlsgatan 44, 114 29 Stockholm', 59.3389, 18.0726, 'retailer', 'https://www.cigarrummet.com/', 'Established Norrmalm tobacconist, 35+ years; isolated members-only smoking lounge upstairs, outdoor smoking area Apr–Oct.', now()),
  ('stockholm-brobergs', 'Brobergs Tobakshandel Stockholm', 'Stockholm', 'Sweden', 'Sturegallerian 39, 114 46 Stockholm', 59.3370, 18.0760, 'retailer', 'https://www.brobergs.se/', 'Historic Habanos Specialist (founded 1881) inside Sturegallerian. Walk-in humidor; Cuban and New World depth.', now()),
  ('stockholm-roberts-tobak', 'Roberts Tobak', 'Stockholm', 'Sweden', 'Rörstrandsgatan 18, 113 40 Stockholm', 59.3438, 18.0356, 'retailer', 'https://www.robertstobak.se/', 'Vasastan tobacconist; La Casa del Habano-affiliated retailer with a serious Cuban selection.', now()),
  ('stockholm-kungstobak', 'Kungstobak', 'Stockholm', 'Sweden', 'Kungsgatan 68, 111 22 Stockholm', 59.3360, 18.0584, 'retailer', 'https://www.kungstobak.com/', 'Long-running central Stockholm tobacconist on Kungsgatan; cigars, pipes, accessories.', now()),
  ('stockholm-cigarrklubben', 'Cigarrklubben', 'Stockholm', 'Sweden', 'Fleminggatan 15, 112 26 Stockholm', 59.3326, 18.0459, 'club', 'https://cigarrklubben.se/', 'Private 24/7 members club on Kungsholmen, in operation since 2012. Limited public Fri–Sat 12:00–18:00 by booking.', now()),
  ('stockholm-cigarrhyllan', 'Cigarrhyllan', 'Stockholm', 'Sweden', 'Ulricehamnsvägen 32, 121 39 Johanneshov', 59.2980, 18.0921, 'retailer', 'https://cigarrhyllan.se/', 'Johanneshov cigar specialist with sizeable humidor and online store.', now()),
  ('stockholm-stockholms-cigarr-lounge', 'Stockholms Cigarr Lounge', 'Stockholm', 'Sweden', 'Turingevägen 38b, 125 57 Älvsjö', 59.2702, 18.0030, 'lounge', NULL, 'Cigar lounge in Älvsjö; member meetups and tastings, run by Stockholm''s cigar community.', now()),

  -- Gothenburg
  ('gothenburg-brobergs', 'Brobergs Tobakshandel Gothenburg', 'Gothenburg', 'Sweden', 'Arkaden 6, 411 07 Göteborg', 57.7065, 11.9686, 'retailer', 'https://www.brobergs.se/', 'The original Brobergs (since 1881) in Arkaden. La Casa del Habano-affiliated; Habanos Specialist.', now()),
  ('gothenburg-sweets-n-cigars', 'Sweets ''n Cigars', 'Gothenburg', 'Sweden', 'Redbergsvägen 6, 416 65 Göteborg', 57.7160, 11.9982, 'retailer', 'https://cigaro.sweetsncigars.se/', 'Olskroken shop combining premium cigars in a walk-in humidor with a Belgian-chocolate counter.', now()),

  -- Malmö
  ('malmo-cigarrsallskap', 'Malmö Cigarrsällskap', 'Malmö', 'Sweden', 'Rönnviksgatan 13, 213 74 Malmö', 55.5699, 13.0323, 'club', 'https://www.facebook.com/pages/Malm%C3%B6-Cigarrs%C3%A4llskap/362185207539223', 'Member-run cigar society in Limhamn (registered as ideell förening since 2018). Hosts industry visits (Hamlet Paredes etc.); approach via Facebook / Instagram @malmocigarrsallskap.', now()),
  ('malmo-brobergs', 'Brobergs Tobakshandel Malmö', 'Malmö', 'Sweden', 'Södra Förstadsgatan 41, 211 43 Malmö (Triangeln)', 55.5963, 13.0010, 'retailer', 'https://www.brobergs.se/', 'Brobergs'' Malmö location inside Triangeln shopping centre — cigars, pipe tobacco, accessories.', now()),

  -- Lund
  ('lund-zigge-zigarett', 'Zigge Zigarett', 'Lund', 'Sweden', 'Stora Fiskaregatan 7, 222 24 Lund', 55.7039, 13.1928, 'retailer', NULL, 'Compact central-Lund tobacconist with a surprising Habanos selection sourced via Habanos Nordic.', now()),

  -- Helsingborg
  ('helsingborg-kind-cigars', 'Kind Cigars', 'Helsingborg', 'Sweden', 'Kvarnstensgatan 13, 252 27 Helsingborg', 56.0431, 12.7345, 'retailer', 'https://www.kindcigars.se/', 'Helsingborg cigar specialist; carries Habanos, Plasencia, ADVentura and other premium NW lines. Hosts Cigarrklubben Garrarna.', now()),

  -- Linköping
  ('linkoping-cubano', 'Cubano.se', 'Linköping', 'Sweden', 'Videgatan 6 B, 582 49 Linköping', 58.4108, 15.6219, 'retailer', 'https://cubano.se/', 'Linköping cigar shop and online retailer; broad range from Cuba, DR, Nicaragua, Honduras.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- DENMARK
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Copenhagen
  ('copenhagen-danish-pipe-shop', 'The Danish Pipe Shop', 'Copenhagen', 'Denmark', 'Vester Voldgade 92, 1552 København V', 55.6757, 12.5680, 'retailer', 'https://www.danishpipeshop.com/', 'Behind Rådhuspladsen; serious pipe house with a deep Habanos and NW cigar selection and an in-store smoking lounge.', now()),

  -- Aarhus
  ('aarhus-vinspecialisten', 'Vinspecialisten Aarhus C', 'Aarhus', 'Denmark', 'Sønder Allé 12, 8000 Aarhus C', 56.1535, 10.2099, 'retailer', 'https://vinspecialistenaarhus.dk/', 'Habanos Specialist in central Aarhus; wines, spirits, pipes and four climate-controlled cabinet humidors.', now()),

  -- Aalborg
  ('aalborg-la-casa-latina', 'La Casa Latina', 'Aalborg', 'Denmark', 'Kastetvej 35, 9000 Aalborg', 57.0510, 9.9123, 'retailer', 'https://lacasalatina.dk/', 'Aalborg Habanos Specialist focused on Latin American imports; cigars and rum.', now()),
  ('aalborg-vinspecialisten', 'Vinspecialisten Aalborg', 'Aalborg', 'Denmark', 'Vingårdsgade 13-15, 9000 Aalborg', 57.0476, 9.9216, 'retailer', 'https://www.vinspecialistenaalborg.dk/', 'Central Aalborg wine and cigar merchant; Cohiba, Montecristo and broader Habanos range.', now()),

  -- Odense
  ('odense-hj-hansen-vinspecialisten', 'Hj Hansen / Vinspecialisten Odense', 'Odense', 'Denmark', 'Vestergade 97-101, 5000 Odense C', 55.3974, 10.3819, 'retailer', 'https://www.hjhansen-vin.dk/', 'Habanos Specialist on Vestergade; long-running Fyn wine-and-cigar house.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- NORWAY
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Oslo (in addition to the Karl Johan flagship already in 005)
  ('oslo-sol-cigar', 'Sol Cigar Co.', 'Oslo', 'Norway', 'Henrik Ibsens gate 28, 0255 Oslo', 59.9162, 10.7233, 'retailer', 'https://solcigar.no/', 'Norway''s first Habanos Specialist, founded 1911, opposite the Royal Palace. Vintage Habanos cabinet (10+ years aged).', now()),
  ('oslo-augusto-cigars', 'Augusto Cigars', 'Oslo', 'Norway', 'Tollbugata 19, 0152 Oslo', 59.9112, 10.7430, 'retailer', 'https://augustocigars.no/', 'Cigar shop and elegant basement members'' lounge in one of Oslo''s oldest buildings; ask politely at the counter.', now()),

  -- Stavanger
  ('stavanger-havana-magasinet', 'Havana-Magasinet', 'Stavanger', 'Norway', 'Kirkegata 1, 4006 Stavanger', 58.9700, 5.7330, 'retailer', 'https://havanamagasinet.no/', 'Norway''s oldest specialised tobacconist, on Domkirkeplassen by Stavanger Cathedral. Deep cigar and pipe range.', now()),

  -- Trondheim
  ('trondheim-bamboo-shop', 'Bamboo-Shop', 'Trondheim', 'Norway', 'Jomfrugata 20, 7010 Trondheim', 63.4308, 10.3940, 'retailer', 'https://www.bamboolt.com/', 'Central Trondheim shop carrying cigars, pipe tobacco and accessories.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- FINLAND
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  -- Helsinki (in addition to Zigge already in 005)
  ('helsinki-havanna-aitta', 'Havanna-Aitta', 'Helsinki', 'Finland', 'Pohjoinen Makasiinikatu 6, 00130 Helsinki', 60.1640, 24.9510, 'retailer', 'https://www.havanna-aitta.fi/', 'Finland''s oldest tobacconist (1897). Habanos and NW cigars in central Kaartinkaupunki.', now()),
  ('helsinki-toolon-sikarikauppa', 'Töölön Sikarikauppa', 'Helsinki', 'Finland', 'Töölönkatu 32, 00260 Helsinki', 60.1820, 24.9221, 'retailer', 'http://www.toolonsikarikauppa.fi/', 'Töölö neighbourhood cigar shop since 2000; near Scandic and Crowne Plaza hotels.', now()),

  -- Turku
  ('turku-pikku-havanna', 'Pikku-Havanna', 'Turku', 'Finland', 'Linnankatu 8, 20100 Turku', 60.4516, 22.2569, 'pub', 'https://pikkuhavanna.fi/', 'Tiny central-Turku cigar bar (~10 seats) with indoor smoking room, terrace and a serious rum list.', now())

ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────────────────────
-- ICELAND
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_lounges (slug, name, city, country, address, lat, lng, type, website, perks, verified_at) VALUES

  ('reykjavik-bjork-tobaksverslun', 'Björk Tóbaksverslun', 'Reykjavik', 'Iceland', 'Bankastræti 6, 101 Reykjavík', 64.1466, -21.9388, 'retailer', 'https://www.bjork.is/', 'Iceland''s Habanos Specialist — the northernmost in the world. Well-stocked Cuban and NW range in central Reykjavík.', now())

ON CONFLICT (slug) DO NOTHING;
