-- Add Stripe columns to users table
-- Run this in Supabase SQL Editor

-- Add stripe_customer_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add stripe_subscription_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Ensure subscription_tier column exists (should already exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
