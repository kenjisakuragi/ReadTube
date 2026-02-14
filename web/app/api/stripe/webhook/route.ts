import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
    )

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const customerId = session.customer as string
                const subscriptionId = session.subscription as string
                const plan = session.metadata?.plan || 'single'
                const channelId = session.metadata?.channel_id || null

                // Find user by stripe_customer_id or by email
                let { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (!user && session.customer_email) {
                    const result = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', session.customer_email)
                        .single()
                    user = result.data
                }

                if (user) {
                    const updateData: Record<string, any> = {
                        subscription_tier: plan === 'allaccess' ? 'allaccess' : 'single',
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                    }

                    // For single plan, store the subscribed channel
                    if (plan === 'single' && channelId) {
                        updateData.subscribed_channel_id = channelId
                    }

                    // For allaccess, clear any single-channel restriction
                    if (plan === 'allaccess') {
                        updateData.subscribed_channel_id = null
                    }

                    await supabase
                        .from('users')
                        .update(updateData)
                        .eq('id', user.id)
                    console.log(`[Stripe] User ${user.id} upgraded to ${plan}`)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string
                const status = subscription.status

                if (status !== 'active' && status !== 'trialing') {
                    await supabase
                        .from('users')
                        .update({ subscription_tier: 'free' })
                        .eq('stripe_customer_id', customerId)
                }

                console.log(`[Stripe] Customer ${customerId} subscription updated: ${status}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                await supabase
                    .from('users')
                    .update({
                        subscription_tier: 'free',
                        stripe_subscription_id: null,
                        subscribed_channel_id: null,
                    })
                    .eq('stripe_customer_id', customerId)

                console.log(`[Stripe] Customer ${customerId} subscription cancelled`)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const customerId = invoice.customer as string
                console.warn(`[Stripe] Payment failed for customer ${customerId}`)
                break
            }
        }
    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
