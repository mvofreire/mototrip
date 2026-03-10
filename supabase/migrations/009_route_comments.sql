-- Migration: Route Comments System
-- Description: Create route_comments table with RLS policies
-- Date: 2026-03-10

-- Create route_comments table
CREATE TABLE route_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_route_comments_route_id ON route_comments(route_id);
CREATE INDEX idx_route_comments_user_id ON route_comments(user_id);
CREATE INDEX idx_route_comments_created_at ON route_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE route_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read comments on published routes
CREATE POLICY "Anyone can read comments on published routes"
  ON route_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_comments.route_id
      AND routes.published = true
    )
  );

-- RLS Policy: Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON route_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM routes
      WHERE routes.id = route_comments.route_id
      AND routes.published = true
    )
  );

-- RLS Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON route_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON route_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON route_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_route_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on comment updates
CREATE TRIGGER trigger_update_route_comments_updated_at
  BEFORE UPDATE ON route_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_route_comments_updated_at();

-- Add comment to table
COMMENT ON TABLE route_comments IS 'User comments on motorcycle routes';
COMMENT ON COLUMN route_comments.content IS 'Comment text with max 500 characters';
COMMENT ON COLUMN route_comments.route_id IS 'Reference to the route being commented on';
COMMENT ON COLUMN route_comments.user_id IS 'Reference to the user who made the comment';
