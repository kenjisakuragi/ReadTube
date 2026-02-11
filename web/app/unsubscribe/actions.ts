'use server'

import { createClient } from '@supabase/supabase-js'

export async function processUnsubscribe(token: string) {
    if (!token) {
        return { success: false, message: 'Invalid token' }
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase credentials for unsubscribe action')
        return { success: false, message: 'Server configuration error' }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        // 1. Find user by token
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('unsubscribe_token', token)
            .single()

        if (userError || !user) {
            console.error('User lookup failed:', userError)
            return { success: false, message: 'Invalid or expired token' }
        }

        // 2. Delete all subscriptions for found user
        const { error: deleteError } = await supabaseAdmin
            .from('subscriptions')
            .delete()
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Subscription deletion failed:', deleteError)
            return { success: false, message: 'Failed to process unsubscribe request' }
        }

        return { success: true, email: user.email }

    } catch (e: any) {
        console.error('Unsubscribe exception:', e)
        return { success: false, message: e.message }
    }
}
