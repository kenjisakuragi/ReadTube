import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const { email, plan, channelId } = await req.json()

        if (!email || !plan) {
            return NextResponse.json({ error: 'Missing email or plan' }, { status: 400 })
        }

        // Validate plan
        const planConfig = PLANS[plan as keyof typeof PLANS]
        if (!planConfig) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
        }

        // Single plan requires a channelId
        if (plan === 'single' && !channelId) {
            return NextResponse.json({ error: 'Missing channelId for single plan' }, { status: 400 })
        }

        // Look up or create user in Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_KEY!
        )

        const { data: user } = await supabase
            .from('users')
            .select('id, email, stripe_customer_id')
            .eq('email', email)
            .single()

        let customerId = user?.stripe_customer_id

        // Create or retrieve Stripe customer
        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: { supabase_user_id: user?.id?.toString() || '' },
            })
            customerId = customer.id

            // Save stripe_customer_id to user
            if (user) {
                await supabase
                    .from('users')
                    .update({ stripe_customer_id: customerId })
                    .eq('id', user.id)
            }
        }

        // Build metadata for the checkout session
        const sessionMetadata: Record<string, string> = {
            supabase_user_id: user?.id?.toString() || '',
            plan,
        }
        if (plan === 'single' && channelId) {
            sessionMetadata.channel_id = channelId
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://readtube.jp'}/subscribe/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://readtube.jp'}/#pricing`,
            metadata: sessionMetadata,
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            locale: 'ja',
        })

        return NextResponse.json({ url: session.url })
    } catch (error: any) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
