-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  restaurant_slug VARCHAR(255) UNIQUE NOT NULL
);

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  business_id INT REFERENCES businesses(id) ON DELETE CASCADE,
  html TEXT NOT NULL,
  active BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: insert a test business
INSERT INTO businesses (name, email, password_hash, restaurant_slug)
VALUES ('Pizza Palace', 'pizza@example.com', 'changeme', 'pizza-palace')
ON CONFLICT (email) DO NOTHING;
