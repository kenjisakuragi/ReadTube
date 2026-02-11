import { createClient } from '@supabase/supabase-js'
import { config } from './config'

const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = config.SUPABASE_SERVICE_KEY! // Always use Service Key for this server-side module

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in subscription_manager.ts")
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '')

export async function getSubscribersForChannel(channelId: string): Promise<Array<{ email: string, token: string }>> {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                user_id,
                users!inner(email, unsubscribe_token)
            `)
            .eq('channel_id', channelId)

        if (error) {
            console.error("Error fetching subscribers:", error)
            return []
        }

        return data.map((sub: any) => ({
            email: sub.users.email,
            token: sub.users.unsubscribe_token
        }))
    } catch (e) {
        console.error("Error reading subscribers:", e)
        return []
    }
}
