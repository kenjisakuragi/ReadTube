
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Loaded' : 'Missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Loaded' : 'Missing');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    console.log('Checking videos table...');
    const { data: videos, error: videosError } = await supabase.from('videos').select('*').limit(1);

    if (videosError) {
        console.log('  ❌ videos table error:', videosError.message);
    } else {
        console.log('  ✅ videos table exists!');
    }

    console.log('Checking processed_videos table...');
    const { data: pv, error: pvError } = await supabase.from('processed_videos').select('*').limit(1);

    if (pvError) {
        console.log('  ❌ processed_videos table error:', pvError.message);
    } else {
        console.log('  ✅ processed_videos table exists!');
    }
}

check().catch(console.error);
