import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
        )

        const { data: user } = await supabase
            .from('users')
            .select('stripe_customer_id')
            .eq('email', email)
            .single()

        if (!user?.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing account found for this email' }, { status: 404 })
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://readtube.jp'}/dashboard`,
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error('Billing portal error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
