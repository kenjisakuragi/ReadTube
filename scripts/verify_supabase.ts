import dotenv from 'dotenv';
dotenv.config();
import { getSubscribersForChannel } from '../src/services/subscription_manager';

async function testSubscribers() {
    const channelIds = ['UCxxxx', 'UCyyyy', 'hYF4fQYlrso']; // common test IDs

    console.log("Checking for subscribers in Supabase...");

    for (const id of channelIds) {
        const subs = await getSubscribersForChannel(id);
        console.log(`Channel [${id}]: Found ${subs.length} subscribers.`);
        subs.forEach(s => console.log(`  - ${s.email} (Token: ${s.token.substring(0, 8)}...)`));
    }
}

testSubscribers().catch(console.error);
