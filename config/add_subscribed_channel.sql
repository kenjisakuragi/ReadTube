-- Add subscribed_channel_id column for Single plan support
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscribed_channel_id text;

-- subscription_tier values: 'free', 'single', 'allaccess'
-- For single plan, subscribed_channel_id stores the YouTube channel ID
-- For allaccess plan, subscribed_channel_id is NULL (all channels accessible)
