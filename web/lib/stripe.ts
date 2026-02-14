import Stripe from 'stripe'

// Only initialize Stripe if the secret key is available
// This prevents build-time errors when env vars aren't set
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
    })
    : null as unknown as Stripe

export const PLANS = {
    standard: {
        name: 'Standard',
        priceId: process.env.STRIPE_PRICE_ID_STANDARD || '',
        price: 980,
    },
} as const
