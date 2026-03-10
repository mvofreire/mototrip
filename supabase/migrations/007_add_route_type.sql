-- Add route_type field to routes table
ALTER TABLE routes ADD COLUMN route_type VARCHAR(20);

-- Add check constraint for valid route types
ALTER TABLE routes ADD CONSTRAINT routes_route_type_check 
  CHECK (route_type IN ('loop', 'out_and_back'));

-- Add index for route_type filtering
CREATE INDEX idx_routes_route_type ON routes(route_type);

-- Add comment
COMMENT ON COLUMN routes.route_type IS 'Type of route: loop (circular) or out_and_back (same path return)';
