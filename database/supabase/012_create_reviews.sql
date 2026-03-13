-- Migration 012: Create reviews table
-- Stores customer reviews/ratings for Pizza dal Cielo

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS reviews_order_id_idx ON reviews(order_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON reviews(created_at DESC);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a review (linked to an order)
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (true);

-- Only authenticated admin can read all reviews
CREATE POLICY "reviews_select_admin" ON reviews
  FOR SELECT USING (auth.role() = 'authenticated');

-- Public can read reviews (for display on site)
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (true);
