#!/usr/bin/env node

/**
 * Supabase Setup Script for MyCar Portrait
 * This script helps set up the Supabase backend with required tables and functions
 */

const prompts = require('prompts');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// SQL for creating tables
const SCHEMA_SQL = `
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apple_id_hash TEXT UNIQUE,
  is_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credits ledger for tracking transactions
CREATE TABLE IF NOT EXISTS credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  balance_after INT NOT NULL,
  source TEXT NOT NULL,
  receipt_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Available styles catalog
CREATE TABLE IF NOT EXISTS styles (
  style_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cost INT DEFAULT 30,
  is_included BOOLEAN DEFAULT false,
  preview_url TEXT,
  background_prompt TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User's unlocked styles
CREATE TABLE IF NOT EXISTS user_styles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  style_id TEXT REFERENCES styles(style_id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, style_id)
);

-- User's processed assets
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_url TEXT,
  portrait_url TEXT NOT NULL,
  style_id TEXT REFERENCES styles(style_id),
  processing_time_ms INT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS processing_limits (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INT DEFAULT 0,
  PRIMARY KEY(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id_hash);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_styles_user ON user_styles(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Seed data for styles
const SEED_STYLES_SQL = `
-- Insert included styles (free with unlock)
INSERT INTO styles (style_id, title, description, cost, is_included, sort_order) VALUES
  ('minimal', 'Minimal', 'Clean and simple background', 0, true, 1),
  ('dark_gradient', 'Dark Gradient', 'Sophisticated dark gradient', 0, true, 2),
  ('asphalt', 'Asphalt', 'Street racing inspired', 0, true, 3);

-- Insert premium styles (30 credits each)
INSERT INTO styles (style_id, title, description, cost, is_included, sort_order) VALUES
  ('neon', 'Neon', 'Vibrant neon lights', 30, false, 4),
  ('blueprint', 'Blueprint', 'Technical drawing style', 30, false, 5),
  ('frosted_glass', 'Frosted Glass', 'Modern glass effect', 30, false, 6),
  ('sunset', 'Sunset', 'Golden hour vibes', 30, false, 7),
  ('carbon_weave', 'Carbon Weave', 'Carbon fiber texture', 30, false, 8),
  ('bokeh_night', 'Bokeh Night', 'City lights bokeh', 30, false, 9),
  ('garage_glow', 'Garage Glow', 'Professional garage lighting', 30, false, 10),
  ('cinematic_rain', 'Cinematic Rain', 'Dramatic rain effect', 30, false, 11),
  ('retro_film', 'Retro Film', 'Vintage film aesthetic', 30, false, 12);
`;

// RLS Policies
const RLS_POLICIES_SQL = `
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_limits ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);
  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Credits ledger policies
CREATE POLICY "Users can view own credits" ON credits_ledger
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Styles policies (public read)
CREATE POLICY "Styles are viewable by everyone" ON styles
  FOR SELECT USING (true);

-- User styles policies
CREATE POLICY "Users can view own styles" ON user_styles
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Assets policies
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid()::text = user_id::text);
  
CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Processing limits policies
CREATE POLICY "Users can view own limits" ON processing_limits
  FOR SELECT USING (auth.uid()::text = user_id::text);
`;

async function main() {
  console.log('🚗 MyCar Portrait - Supabase Setup\n');

  const response = await prompts([
    {
      type: 'select',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { title: 'Generate SQL files', value: 'generate' },
        { title: 'View setup instructions', value: 'instructions' },
        { title: 'Create .env.local file', value: 'env' },
      ],
    },
  ]);

  switch (response.action) {
    case 'generate':
      await generateSQLFiles();
      break;
    case 'instructions':
      showInstructions();
      break;
    case 'env':
      await createEnvFile();
      break;
  }
}

async function generateSQLFiles() {
  const sqlDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir, { recursive: true });
  }

  // Generate timestamp for migration files
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

  // Write schema file
  const schemaFile = path.join(sqlDir, `${timestamp}_create_schema.sql`);
  fs.writeFileSync(schemaFile, SCHEMA_SQL);
  console.log(`✅ Created: ${schemaFile}`);

  // Write seed file
  const seedFile = path.join(sqlDir, `${timestamp}_seed_styles.sql`);
  fs.writeFileSync(seedFile, SEED_STYLES_SQL);
  console.log(`✅ Created: ${seedFile}`);

  // Write RLS policies file
  const rlsFile = path.join(sqlDir, `${timestamp}_rls_policies.sql`);
  fs.writeFileSync(rlsFile, RLS_POLICIES_SQL);
  console.log(`✅ Created: ${rlsFile}`);

  console.log('\n📝 SQL files generated successfully!');
  console.log('Next steps:');
  console.log('1. Create a Supabase project at https://app.supabase.com');
  console.log('2. Run these migrations in your Supabase SQL editor');
  console.log('3. Copy your project URL and anon key to .env.local');
}

function showInstructions() {
  console.log(`
📚 Supabase Setup Instructions

1. Create a new Supabase project:
   - Go to https://app.supabase.com
   - Click "New project"
   - Name it "mycar-portrait" or similar
   - Choose a region close to your users
   - Set a strong database password

2. Run the SQL migrations:
   - Go to SQL Editor in Supabase dashboard
   - Run the generated SQL files in order:
     a) create_schema.sql
     b) seed_styles.sql
     c) rls_policies.sql

3. Create storage bucket:
   - Go to Storage in Supabase dashboard
   - Create a new bucket called "portraits"
   - Set it to PUBLIC
   - Add policy for authenticated uploads

4. Set up Edge Functions:
   - Install Supabase CLI: npm install -g supabase
   - Run: supabase init
   - Create functions in supabase/functions/
   - Deploy with: supabase functions deploy

5. Configure environment variables:
   - Copy project URL and anon key from Settings > API
   - Add to .env.local file
   - Add to EAS secrets for production

6. Test the connection:
   - Run the app in development mode
   - Check Supabase logs for activity

Need help? Check the Supabase docs at https://supabase.com/docs
`);
}

async function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: '.env.local already exists. Overwrite?',
      initial: false,
    });
    
    if (!overwrite) {
      console.log('Cancelled.');
      return;
    }
  }

  const config = await prompts([
    {
      type: 'text',
      name: 'supabaseUrl',
      message: 'Supabase Project URL:',
      validate: value => value.includes('supabase.co') || 'Invalid Supabase URL',
    },
    {
      type: 'text',
      name: 'supabaseAnonKey',
      message: 'Supabase Anon Key:',
      validate: value => value.length > 20 || 'Invalid key',
    },
    {
      type: 'text',
      name: 'revenueCatKey',
      message: 'RevenueCat API Key (optional):',
    },
  ]);

  const envContent = `# MyCar Portrait Environment Variables
# DO NOT COMMIT THIS FILE

# Supabase
EXPO_PUBLIC_SUPABASE_URL=${config.supabaseUrl}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${config.supabaseAnonKey}

# RevenueCat
EXPO_PUBLIC_REVENUECAT_API_KEY=${config.revenueCatKey || ''}

# AI Provider (configure based on your choice)
EXPO_PUBLIC_AI_PROVIDER_URL=
EXPO_PUBLIC_AI_PROVIDER_KEY=

# Analytics (optional)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_MIXPANEL_TOKEN=

# Production values (for EAS secrets)
EXPO_PUBLIC_SUPABASE_URL_PROD=
EXPO_PUBLIC_SUPABASE_ANON_KEY_PROD=
EXPO_PUBLIC_REVENUECAT_API_KEY_PROD=
`;

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Created .env.local file`);
  console.log('\n⚠️  Remember to:');
  console.log('1. Add .env.local to .gitignore');
  console.log('2. Set production values in EAS secrets');
  console.log('3. Keep your keys secure!');
}

// Run the script
main().catch(console.error);