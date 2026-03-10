-- Add thumbnail_url field to routes table for map preview images
ALTER TABLE routes ADD COLUMN thumbnail_url TEXT;

-- Add index for thumbnail_url queries
CREATE INDEX idx_routes_thumbnail_url ON routes(thumbnail_url) WHERE thumbnail_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN routes.thumbnail_url IS 'URL of the route map thumbnail/preview image stored in Supabase Storage';
