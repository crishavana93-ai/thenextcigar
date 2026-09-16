-- Malmö Cigarrsällskap moved: Kalendegatan 10C (Old Town), not Rönnviksgatan 13.
update public.partner_lounges
   set address = 'Kalendegatan 10C, 211 35 Malmö', lat = 55.6058, lng = 13.0029
 where slug = 'malmo-cigarrsallskap';
