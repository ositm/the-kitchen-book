-- Create Profiles table (tied to auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  city text,
  created_at timestamptz DEFAULT now()
);

-- Create Ingredients table
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  aliases text[] DEFAULT '{}',
  category text NOT NULL,
  is_staple boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Recipes table
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  cuisine text NOT NULL,
  meal_type text NOT NULL,
  cook_time_mins int NOT NULL,
  cost_level int NOT NULL,
  servings int DEFAULT 4,
  steps jsonb NOT NULL,
  image_url text,
  video_url text,
  mood_tags text[] DEFAULT '{}',
  dietary_flags text[] DEFAULT '{}',
  source text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create Recipe Ingredients join table
CREATE TABLE recipe_ingredients (
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
  qty numeric,
  unit text,
  is_core boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (recipe_id, ingredient_id)
);

-- Create Pantry Items table
CREATE TABLE pantry_items (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, ingredient_id)
);

-- Create Vendors table
CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cities text[] NOT NULL,
  country text DEFAULT 'NG',
  url_template text NOT NULL,
  vendor_type text NOT NULL,
  logo_url text,
  sort_order int DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- Create Tips table
CREATE TABLE tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  publish_date date,
  created_at timestamptz DEFAULT now()
);

-- Create Posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Likes table
CREATE TABLE likes (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Create Reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Vendor Clicks table
CREATE TABLE vendor_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  city text,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_clicks ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read recipes" ON recipes FOR SELECT USING (is_published = true);
CREATE POLICY "Public read recipe_ingredients" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Public read vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Public read tips" ON tips FOR SELECT USING (true);

-- Profiles
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Pantry Items
CREATE POLICY "Users can read own pantry" ON pantry_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pantry" ON pantry_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pantry" ON pantry_items FOR DELETE USING (auth.uid() = user_id);

-- Posts
CREATE POLICY "Public read visible posts" ON posts FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Public read visible comments" ON comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Public read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Reports (Only authenticated users can report, only admins/service role can view)
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Vendor Clicks (Insert only via service role / backend, no public write/read)
-- No policies created implies default deny for anon/authenticated roles.
