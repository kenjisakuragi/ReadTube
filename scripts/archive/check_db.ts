import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../src/services/subscription_manager';

async function checkUsers() {
    const { data: users, error } = await (supabase as any).from('users').select('*');
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    console.log('--- Current Users in Supabase ---');
    console.table(users);

    const { data: subs, error: subError } = await (supabase as any).from('subscriptions').select('*');
    if (subError) {
        console.error('Error fetching subscriptions:', subError);
        return;
    }
    console.log('\n--- Current Subscriptions ---');
    console.table(subs);
}

checkUsers();
