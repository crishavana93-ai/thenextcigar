-- ============================================================================
-- The Lounge — global cigar events seed (migration 012)
-- ============================================================================
-- Seeds real cigar events worldwide so the /events page returns useful results
-- in any major cigar city. Sources: official festival sites, halfwheel, Cigar
-- Aficionado, Cigar Coop, Cigar Journal, venue calendars and Eventbrite. Dates
-- reflect best-known information for 2026 as of May 2026; refresh annually.
--
-- Honesty notes:
--   * Festival del Habano XXVI (Havana) was officially postponed by Habanos
--     S.A. on Feb 14, 2026 and no new date has been announced. We keep a
--     placeholder entry with the originally announced dates and clearly flag
--     the postponement in the description so members see context.
--   * Recurring monthly lounge events (Carnegie Club, Cohiba Atmosphere, etc.)
--     use one representative upcoming date — refresh quarterly.
--   * Where exact 2026 confirmation isn't published, descriptions say so
--     rather than fabricating precision.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Major annual festivals
-- ----------------------------------------------------------------------------
INSERT INTO public.cigar_events (title, description, city, country, start_at, end_at, is_official, external_url, verified_at) VALUES
  (
    'Festival del Habano XXVI (Postponed)',
    'The 26th edition of Cuba''s flagship Habanos festival was originally scheduled for Feb 23-27, 2026 but was officially postponed indefinitely by Habanos S.A. on Feb 14, 2026 citing the economic situation in Cuba. A new date has not been announced. Listed for reference; check habanos.com for updates.',
    'Havana', 'Cuba',
    '2026-02-23 09:00:00+00', '2026-02-27 23:00:00+00',
    true, 'https://www.habanos.com/en/habano-festivals/', now()
  ),
  (
    'Procigar Festival 2026 — From Soil to Soul',
    'The 18th annual Dominican Republic premium cigar festival hosted by the Procigar association. Guests tour factories and tobacco fields of Davidoff, La Aurora, Arturo Fuente, La Flor Dominicana and others, starting in Santiago de los Caballeros and ending in La Romana. Held Feb 15-20, 2026.',
    'Santiago de los Caballeros', 'Dominican Republic',
    '2026-02-15 14:00:00+00', '2026-02-20 23:00:00+00',
    true, 'https://procigar.org/procigar-festival/', now()
  ),
  (
    'Puro Sabor — Nicaraguan Cigar Festival 2026',
    'Nicaragua''s premier cigar festival, hosted by the Nicaraguan Chamber of Tobacco. Tours of AJ Fernandez, Plasencia, Drew Estate, Joya de Nicaragua, My Father and Padrón factories in Estelí, plus the closing White Party and gala. Held Jan 18-24, 2026.',
    'Esteli', 'Nicaragua',
    '2026-01-18 14:00:00+00', '2026-01-24 23:00:00+00',
    true, 'https://www.purosaborcigarfest.com/', now()
  ),
  (
    'TPE 2026 — Total Product Expo',
    'Tobacco Plus Expo, the largest B2B tobacco, cigar and alternatives trade show in North America. Moved from January to a spring slot in 2026 (Mar 31 - Apr 2) at the Las Vegas Convention Center.',
    'Las Vegas', 'United States',
    '2026-03-31 14:00:00+00', '2026-04-02 23:00:00+00',
    true, 'https://totalproductexpo.com/', now()
  ),
  (
    'PCA 2026 Trade Show',
    'The Premium Cigar Association''s annual trade show, the industry''s most important week for new releases and retailer/manufacturer meetings. Held April 17-20, 2026 at the Ernest N. Morial Convention Center in New Orleans (Las Vegas returns for PCA 2027).',
    'New Orleans', 'United States',
    '2026-04-17 14:00:00+00', '2026-04-20 22:00:00+00',
    true, 'https://pcashow.org/', now()
  ),
  (
    'InterTabac 2026',
    'The world''s largest trade fair for tobacco products and smoking accessories, held at Messe Dortmund. Industry-only event featuring nearly every premium cigar brand of note, plus the Cigar Culture Summit. Sep 15-17, 2026.',
    'Dortmund', 'Germany',
    '2026-09-15 08:00:00+00', '2026-09-17 16:00:00+00',
    true, 'https://www.intertabac.de/en/', now()
  ),
  (
    'Cigar Smoking World Championship — Grand Finale 2026',
    'The 17th annual CSWC slow-smoking world championship grand finale. National qualifiers across 30+ countries (May-August) culminate at the grand finale held the first weekend of September in Split, Croatia. Exact 2026 grand finale date TBC by organizers.',
    'Split', 'Croatia',
    '2026-09-04 16:00:00+00', '2026-09-05 23:00:00+00',
    true, 'https://www.cswcnews.com/', now()
  ),
  (
    'Big Smoke Florida 2026',
    'Cigar Aficionado''s flagship Florida cigar evening at Eden Roc Miami Beach Resort. Editors mingle with cigarmakers, attendees take home an evening bag of premium cigars. May 8, 2026.',
    'Miami', 'United States',
    '2026-05-08 23:00:00+00', '2026-05-09 03:00:00+00',
    true, 'https://www.bigsmokeflorida.com/', now()
  ),
  (
    'Big Smoke Las Vegas 2026 — 30th Anniversary',
    'The 30th anniversary edition of Cigar Aficionado''s most famous event. Two evenings at Horseshoe Las Vegas with seminars, cigarmaker meet-and-greets, the All-Access Party and the Big Smoke Saturday Night. Nov 6-7, 2026.',
    'Las Vegas', 'United States',
    '2026-11-06 23:00:00+00', '2026-11-08 04:00:00+00',
    true, 'https://www.lasvegasbigsmoke.com/', now()
  ),
  (
    'Houston Cigar Week 2026',
    'The 6th annual Houston Cigar Week — six days of brand events, dinners, golf tournaments and the closing main festival across Houston-area lounges. May 19-24, 2026.',
    'Houston', 'United States',
    '2026-05-19 22:00:00+00', '2026-05-24 23:00:00+00',
    true, 'https://www.houstoncigarweek.com/', now()
  ),
  (
    'Tampa Cigar Week 2026',
    'A week of factory tours, brand dinners and pairings across Tampa and Ybor City, culminating in a main festival event. Mar 25-29, 2026.',
    'Tampa', 'United States',
    '2026-03-25 14:00:00+00', '2026-03-29 23:00:00+00',
    true, 'https://www.thetampacigarweek.com/', now()
  ),
  (
    'The Great Smoke 2026',
    'Multi-day cigar event culminating in the main festival at the South Florida Fairgrounds in West Palm Beach. Special TGS releases with Arturo Fuente, Dunbarton Tobacco & Trust and Tatuaje. Mar 12-15, 2026.',
    'West Palm Beach', 'United States',
    '2026-03-12 14:00:00+00', '2026-03-15 23:00:00+00',
    true, 'https://www.thegreatsmoke.com/', now()
  ),
  (
    'NOLA Cigar Festival 2026',
    'New Orleans'' four-day premium cigar festival with brand pavilions, live music, food and spirit pairings. Apr 16-19, 2026.',
    'New Orleans', 'United States',
    '2026-04-16 21:00:00+00', '2026-04-20 01:00:00+00',
    true, 'https://www.nolacigarfestival.com/', now()
  ),
  (
    'San Antonio Cigar Festival 2026',
    'The 4th annual SACF — four days of cigar culture, spirits, food, music and a City Passport Program. Main event Saturday Mar 14 at Beethoven Maennerchor. Mar 12-15, 2026.',
    'San Antonio', 'United States',
    '2026-03-12 22:00:00+00', '2026-03-15 23:00:00+00',
    true, 'https://www.sacigarfestival.org/', now()
  ),
  (
    'Charleston Smoke Out 2026',
    'The 6th annual Charleston Smoke Out — four days of premium cigars, live music, southern food and fellowship in historic Charleston. Apr 30 - May 3, 2026.',
    'Charleston', 'United States',
    '2026-04-30 22:00:00+00', '2026-05-03 23:00:00+00',
    true, 'https://charlestonsmokeout.com/', now()
  ),
  (
    'Holy City Cigar Festival 2026',
    'Charleston''s premium cigar, bourbon and culture festival across distinctive Lowcountry venues. Jun 17-20, 2026.',
    'Charleston', 'United States',
    '2026-06-17 22:00:00+00', '2026-06-20 23:00:00+00',
    true, 'https://www.eventbrite.com/e/holy-city-cigar-festival-june-17-20-2026-tickets-1988256695298', now()
  ),
  (
    'Miami Cigar Festival 2026',
    'Two-day premium cigar festival at Pullman Miami Airport Hotel featuring cigars, spirits tastings, food, live entertainment and brand showcases. Mar 21-22, 2026.',
    'Miami', 'United States',
    '2026-03-21 17:00:00+00', '2026-03-22 23:00:00+00',
    true, 'https://miamicigarfestival.com/', now()
  ),
  (
    'Cigars in Paradise 2026 — Casa de Campo',
    'Inaugural Cigars in Paradise Cigar & Rum Festival at Casa de Campo Resort, La Romana. Brands include Arturo Fuente, Davidoff, Montecristo, Vega Fina, La Aurora and Plasencia. Jun 25-28, 2026.',
    'La Romana', 'Dominican Republic',
    '2026-06-25 16:00:00+00', '2026-06-28 23:00:00+00',
    true, 'https://cigarsinparadise.com/', now()
  ),
  (
    'The Summertime Smoke 2026',
    'Second edition of the UK summer cigar festival at EJ Churchill Shooting Ground, High Wycombe. Master blenders, rare releases, optional clay shooting. Aug 1, 2026.',
    'High Wycombe', 'United Kingdom',
    '2026-08-01 11:00:00+00', '2026-08-01 18:00:00+00',
    true, 'https://thecigarfestival.co.uk/tickets/thesummertimesmoke/', now()
  );

-- ----------------------------------------------------------------------------
-- 2. Venue / lounge headline events
-- ----------------------------------------------------------------------------
INSERT INTO public.cigar_events (title, description, city, country, start_at, end_at, is_official, external_url, verified_at) VALUES
  (
    'Boisdale Xerjoff Cigar Smoker of the Year 2026',
    '"The most glamorous night in the cigar calendar." Black-tie dinner and awards at Boisdale of Canary Wharf, in association with Vina Santa Rita and Xerjoff. Monday Nov 30, 2026.',
    'London', 'United Kingdom',
    '2026-11-30 18:30:00+00', '2026-12-01 00:00:00+00',
    true, 'https://boisdaletickets.co.uk/', now()
  ),
  (
    'Aleppo Smoker — Cigar Night 2026',
    '20th annual cigar night at Aleppo Shriners Auditorium in Wilmington, MA. Premium cigars, full-course dinner and spirits tasting. Proceeds benefit the Shriners Children''s Transportation Fund. Feb 27, 2026.',
    'Wilmington', 'United States',
    '2026-02-27 23:00:00+00', '2026-02-28 03:00:00+00',
    true, 'https://nobles.alepposhriners.com/event/cigar-night-2026/', now()
  ),
  (
    'World Cigar Show Dubai 2026',
    'The second edition of the World Cigar Show, organised by Quartz Business Events in partnership with the Premium Cigar Association. Dubai World Trade Centre, Nov 10-11, 2026.',
    'Dubai', 'United Arab Emirates',
    '2026-11-10 06:00:00+00', '2026-11-11 14:00:00+00',
    true, 'https://premiumcigars.org/world-cigar-show-dubai-what-you-need-to-know/', now()
  ),
  (
    'Monte-Carlo Cigar Club — Master Blender Evening',
    'Invitation-only tasting evening at the Monte-Carlo Cigar Club inside Casino de Monte-Carlo, opened May 2025. Programme of master-blender-led tastings, Michelin-star private dinners and live music continues through 2026. Date below is a representative summer 2026 evening — refer to the club for current programme.',
    'Monte-Carlo', 'Monaco',
    '2026-07-17 19:00:00+00', '2026-07-17 23:30:00+00',
    true, 'https://www.montecarlosbm.com/en/bar-nightclub-monaco/le-club-monte-carlo-cigar-club', now()
  );

-- ----------------------------------------------------------------------------
-- 3. City-specific recurring events
--    Representative upcoming dates pulled from venue calendars / Facebook /
--    Eventbrite. These series run monthly or weekly; refresh quarterly.
-- ----------------------------------------------------------------------------
INSERT INTO public.cigar_events (title, description, city, country, start_at, end_at, is_official, external_url, verified_at) VALUES
  -- London (recurring sampling and tasting nights at the historic St James's / Mayfair shops)
  (
    'JJ Fox Cuban & New World Sampling Evening',
    'Cigar and drinks pairing evening in the first-floor Sampling Lounge at James J. Fox, 19 St James''s Street — the oldest tobacconist in the world. Cuban or New World pairings with rum, whisky or cognac. Series runs throughout the year; check jjfox.co.uk/events for next date.',
    'London', 'United Kingdom',
    '2026-06-18 18:30:00+00', '2026-06-18 21:30:00+00',
    false, 'https://www.jjfox.co.uk/events', now()
  ),
  (
    'Sautter of Mayfair — Cigar Evening',
    'Tasting evening at Sautter of Mayfair, 106 Mount Street — Laurence Davis''s acclaimed home for aged and vintage Cubans. Hosted tastings and trips to Cuba run throughout the year; check website or Instagram @sautter_cigars for next event.',
    'London', 'United Kingdom',
    '2026-07-09 18:30:00+00', '2026-07-09 21:30:00+00',
    false, 'https://www.sauttercigars.com/', now()
  ),

  -- New York (Carnegie Club's regular cigar & Sinatra programme)
  (
    'Sinatra Saturdays at The Carnegie Club',
    'New York City''s longest-running Sinatra show — Steven Maglio and the Stan Rubin 11-Piece Orchestra — at the Carnegie Club, 156 W 56th. One of the only Manhattan rooms where you can legally smoke a fine cigar with a cocktail. Every Saturday; the date below is a representative upcoming Saturday.',
    'New York', 'United States',
    '2026-05-23 23:00:00+00', '2026-05-24 03:00:00+00',
    false, 'https://www.carnegie-club.com/', now()
  ),
  (
    'Cigars & Conversations at The Carnegie Club',
    'Recurring cigar and cocktail meetup at the Carnegie Club hosted via the NYC Culture Meetup group. Includes admission and one premium cigar; live jazz on most weekend evenings.',
    'New York', 'United States',
    '2026-05-19 22:30:00+00', '2026-05-20 01:30:00+00',
    false, 'https://www.meetup.com/nyc-culture/events/314259721/', now()
  ),

  -- Miami (Casa de Montecristo brand nights — Brickell)
  (
    'Casa de Montecristo Brickell — Brand Night',
    'Monthly brand-led cigar pairing nights at Casa de Montecristo by Prime Cigar & Whiskey Bar, Brickell — Altadis''s flagship Miami lounge. 4,700 sq ft humidor and whiskey bar. Check casademontecristo.com/cigar-events for the current month''s lineup.',
    'Miami', 'United States',
    '2026-06-12 23:00:00+00', '2026-06-13 02:00:00+00',
    false, 'https://www.casademontecristo.com/cigar-events.html', now()
  ),

  -- Chicago (Iwan Ries — oldest family-owned cigar shop in America)
  (
    'Iwan Ries & Co. — In-Store Cigar Event',
    'Brand sampling and meet-the-maker events on the 2nd-floor smoking lounge at Iwan Ries & Co., 19 S. Wabash Ave — serving Chicago since 1857. Check their Facebook page and store calendar for the current month''s schedule.',
    'Chicago', 'United States',
    '2026-06-13 21:00:00+00', '2026-06-14 00:00:00+00',
    false, 'https://www.iwanries.com/', now()
  ),

  -- Geneva (Davidoff flagship)
  (
    'Davidoff of Geneva Flagship — Year of the Horse Tasting',
    'Tasting of the 2026 Davidoff Year of the Horse limited edition (the Zodiac Series cigar released worldwide Jan 29, 2026) at the Davidoff flagship on rue de Rive, Geneva. Series of regional flagship tastings continue through the year — confirm with the boutique.',
    'Geneva', 'Switzerland',
    '2026-06-04 17:00:00+00', '2026-06-04 20:00:00+00',
    true, 'https://us.davidoffgeneva.com/discover/news-events', now()
  ),

  -- Frankfurt (Davidoff Lounge at the Sheraton FRA Airport — only smoking bar inside FRA)
  (
    'Davidoff Lounge Frankfurt Airport — Cigar Evening',
    'Regular cigar evenings at the Davidoff Lounge inside Sheraton Frankfurt Airport (Hugo-Eckener-Ring 15) — the only smoking bar inside Frankfurt Airport. Open daily; brand-led tastings periodically.',
    'Frankfurt', 'Germany',
    '2026-06-20 19:00:00+00', '2026-06-20 23:00:00+00',
    false, 'https://www.marriott.com/en-us/dining/restaurant-bar/fraas-sheraton-frankfurt-airport-hotel-and-conference-center/6883821-davidoff-lounge.mi', now()
  ),

  -- Hamburg (Davidoff Cigar Lounge — Colonnaden 9)
  (
    'Davidoff Cigar Lounge Hamburg — Tasting Night',
    'Tasting events at Davidoff Cigar Lounge Hamburg, Colonnaden 9. Programme published via @cigarloungehh on Instagram; representative date below.',
    'Hamburg', 'Germany',
    '2026-06-26 18:00:00+00', '2026-06-26 22:00:00+00',
    false, 'https://www.instagram.com/cigarloungehh/', now()
  ),

  -- Tokyo (Le Connaisseur — Cigar Club Ltd / Japan Tobacco joint venture, Ginza)
  (
    'Le Connaisseur Ginza — Cigar Tasting',
    'Tasting evenings at Le Connaisseur Ginza (Ginza Kaikan 1F, 8-6-24 Ginza, Chuo-ku) — the original Le Connaisseur location, opened 1997. Tokyo''s benchmark Habanos-focused cigar bar. Check with the venue for next scheduled tasting.',
    'Tokyo', 'Japan',
    '2026-06-19 11:00:00+00', '2026-06-19 14:00:00+00',
    false, 'https://www.habanos.com/en/lugar/le-connaisseur-shibuya-2/', now()
  ),

  -- Hong Kong (P&L Club — Cohiba Atmosphere)
  (
    'P&L Club / Cohiba Atmosphere Hong Kong — Members Evening',
    'Members evening at P&L Club, Hong Kong''s Cohiba Atmosphere — one of the original Atmosphere lounges, with a walk-in humidor of premium Habanos. The lounge celebrated its 10th anniversary in 2024; programmed evenings continue through 2026.',
    'Hong Kong', 'Hong Kong',
    '2026-06-25 12:00:00+00', '2026-06-25 15:00:00+00',
    false, 'https://www.habanos.com/en/news/10mo-aniversario-del-cohiba-atmosphere-en-hong-kong-en/', now()
  ),

  -- Dubai (LCDH City Walk — Master of Habanos rooftop format)
  (
    'La Casa del Habano Dubai — Master of Habanos Evening',
    'Master of Habanos hosted evenings at LCDH Dubai (City Walk) and rooftop sessions at Oscuro at The Arts Club Dubai. Schedule follows the global Habanos festival calendar and Master of Habanos visits — confirm with the LCDH boutique.',
    'Dubai', 'United Arab Emirates',
    '2026-09-18 16:00:00+00', '2026-09-18 21:00:00+00',
    false, 'https://www.theartsclub.ae/light-it-up/', now()
  ),

  -- Vienna (cigar club programme)
  (
    'Cigars Club Vienna (CCV) — Monthly Meeting',
    'Monthly meeting of Cigars Club Vienna (CCVK), one of Austria''s most active enthusiast clubs. Programme of tastings, guest speakers and dinners; details and venue rotation at ccvk.club.',
    'Vienna', 'Austria',
    '2026-06-11 18:00:00+00', '2026-06-11 22:00:00+00',
    false, 'https://www.ccvk.club/', now()
  ),

  -- Stockholm
  (
    'Cigarrklubben Stockholm — Members Evening',
    'Private members'' cigar club in central Stockholm with 24/7 access. Hosts regular tastings and guest blender visits; non-members can request approval to attend specific events via cigarrklubben.se.',
    'Stockholm', 'Sweden',
    '2026-06-05 17:00:00+00', '2026-06-05 21:00:00+00',
    false, 'https://cigarrklubben.se/', now()
  );
