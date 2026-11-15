-- 026: Tighter box for Centro (Portugal)
--
-- Checked against the start point of the 61 existing routes: the 025 box
-- missed Peniche (west of -9.05) and caught Portalegre (Alentejo, 39.30 N).
-- With this box and the country filter in the submit form, 60 of 61 routes
-- get their saved region; the other one starts in Arouca, which is Norte.

UPDATE public.regions
SET bbox = '{-9.50,39.32,-6.80,40.80}'
WHERE country = 'PT' AND route_region = 'Centro';
