import Stripe from 'stripe'

// Only initialize Stripe if the secret key is available
// This prevents build-time errors when env vars aren't set
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
    })
    : null as unknown as Stripe

export const PLANS = {
    single: {
        name: 'Single',
        priceId: process.env.STRIPE_PRICE_ID_SINGLE || '',
        price: 500,
    },
    allaccess: {
        name: 'All Access',
        priceId: process.env.STRIPE_PRICE_ID_ALLACCESS || '',
        price: 2980,
    },
} as const
