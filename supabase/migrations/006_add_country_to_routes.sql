-- Add country field to routes table
ALTER TABLE routes ADD COLUMN country VARCHAR(2);

-- Add index for country filtering
CREATE INDEX idx_routes_country ON routes(country);

-- Add comment
COMMENT ON COLUMN routes.country IS 'ISO 3166-1 alpha-2 country code (e.g., PT, ES)';
