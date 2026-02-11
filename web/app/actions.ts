'use server'

import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '../../src/services/email'
import channelsData from '../../config/channels.json'

// Define Channel interface locally since importing from page.tsx might be tricky with 'use server'
interface Channel {
    id: string
    name: string
}

export async function registerUser(email: string, channelIds: string[]) {
    if (!email || channelIds.length === 0) {
        return { success: false, message: 'Invalid input' }
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    // Fallback for local development or if env vars are missing
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials for registration action')
        return { success: false, message: 'Server configuration error' }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        const unsubscribeToken = crypto.randomUUID()

        // 1. UPSERT user
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .upsert({ email, unsubscribe_token: unsubscribeToken }, { onConflict: 'email' })
            .select()
            .single()

        if (userError) {
            console.error('User upsert error:', userError)
            throw new Error('Failed to register user')
        }

        // 2. UPSERT subscriptions
        const subscriptions = channelIds.map(channelId => ({
            user_id: userData.id,
            channel_id: channelId
        }))

        // First, we might want to delete existing subscriptions if we want "overwrite" behavior,
        // but the current UI suggests "adding" or "setting" specific channels.
        // The previous code verified upsert, so let's stick to that.
        // Actually, for a clean "Subscribe" action, usually we just add.

        const { error: subError } = await supabaseAdmin
            .from('subscriptions')
            .upsert(subscriptions, { onConflict: 'user_id,channel_id' })

        if (subError) {
            console.error('Subscription upsert error:', subError)
            throw new Error('Failed to register subscriptions')
        }

        // 3. Send Welcome Email
        // Resolve channel names
        const channels = channelsData as Channel[]
        const subscribedChannelNames = channels
            .filter(ch => channelIds.includes(ch.id))
            .map(ch => ch.name)

        // Run email sending asynchronously (don't block response?) 
        // Vercel Server Actions might kill the process once response is sent, so better await it or use `waitUntil` if available (Next.js specific).
        // Since it's critical, we await it.
        await sendWelcomeEmail(email, subscribedChannelNames, userData.unsubscribe_token)

        return { success: true }

    } catch (e: any) {
        console.error('Registration exception:', e)
        return { success: false, message: e.message }
    }
}
