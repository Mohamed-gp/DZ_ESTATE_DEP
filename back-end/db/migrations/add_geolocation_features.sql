-- Add property views tracking table
CREATE TABLE IF NOT EXISTS property_views (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, user_id, DATE(created_at))
);

-- Add property wishlist table
CREATE TABLE IF NOT EXISTS property_wishlist (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, user_id)
);

-- Add location search history table
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT,
    filters JSONB,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius INTEGER DEFAULT 10,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add property statistics table
CREATE TABLE IF NOT EXISTS property_statistics (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    bookings_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(10, 2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id)
);

-- Add user preferences table for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_categories INTEGER[],
    price_range JSONB, -- {"min": 0, "max": 1000000}
    preferred_locations JSONB, -- {"wilayas": [16, 31], "communes": ["Algiers", "Oran"]}
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    search_radius INTEGER DEFAULT 10,
    language VARCHAR(5) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'DZD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_wishlist_user ON property_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_property ON reservations(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);

-- Add full-text search support for properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tsv tsvector;
CREATE INDEX IF NOT EXISTS idx_properties_tsv ON properties USING gin(tsv);

-- Create trigger to update tsv column
CREATE OR REPLACE FUNCTION properties_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS properties_tsv_update ON properties;
CREATE TRIGGER properties_tsv_update 
  BEFORE INSERT OR UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION properties_tsv_trigger();

-- Update existing properties with tsv
UPDATE properties SET tsv = to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''));

-- Add role column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create function to update property statistics
CREATE OR REPLACE FUNCTION update_property_stats(prop_id INTEGER) RETURNS void AS $$
BEGIN
  INSERT INTO property_statistics (property_id, views_count, favorites_count, bookings_count, revenue_total)
  SELECT 
    prop_id,
    COALESCE((SELECT COUNT(*) FROM property_views WHERE property_id = prop_id), 0),
    COALESCE((SELECT COUNT(*) FROM property_wishlist WHERE property_id = prop_id), 0),
    COALESCE((SELECT COUNT(*) FROM reservations WHERE property_id = prop_id AND status = 'paid'), 0),
    COALESCE((SELECT SUM(amount) FROM reservations WHERE property_id = prop_id AND status = 'paid'), 0)
  ON CONFLICT (property_id) DO UPDATE SET
    views_count = EXCLUDED.views_count,
    favorites_count = EXCLUDED.favorites_count,
    bookings_count = EXCLUDED.bookings_count,
    revenue_total = EXCLUDED.revenue_total,
    last_updated = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;