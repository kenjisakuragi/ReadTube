import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../src/services/subscription_manager';

async function setupTestUser() {
    const testEmail = 'kokoronodiary@gmail.com'; // Your verified Resend email
    const channelId = 'UChhw6DlKKTQ9mYSpTfXUYqA'; // Starter Story

    console.log(`Setting up test user: ${testEmail} for channel: ${channelId}`);

    // 1. Create/Get User
    const { data: user, error: userError } = await supabase
        .from('users')
        .upsert({
            email: testEmail,
            unsubscribe_token: 'test-token-real-email'
        }, { onConflict: 'email' })
        .select()
        .single();

    if (userError) {
        console.error('User error:', userError);
        return;
    }

    console.log('User OK:', user.id);

    // 2. Subscribe
    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: user.id,
            channel_id: channelId
        }, { onConflict: 'user_id,channel_id' });

    if (subError) {
        console.error('Subscription error:', subError);
        return;
    }

    console.log('Subscription OK!');
}

setupTestUser();
