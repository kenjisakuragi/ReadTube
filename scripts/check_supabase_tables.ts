import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking Supabase tables...');
    // list tables in public schema
    const { data, error } = await supabase
        .from('pg_tables')
        .select('*')
        .eq('schemaname', 'public'); // pg_tables is not directly accessible via client usually, but let's try a simple query first

    // Trying to insert a dummy record to see if 'videos' table exists
    const { error: videoError } = await supabase
        .from('videos')
        .select('id')
        .limit(1);

    if (videoError) {
        console.log('Videos table likely does not exist:', videoError.message);
    } else {
        console.log('Videos table exists!');
    }

    // Check processed_videos table
    const { error: pvError } = await supabase
        .from('processed_videos')
        .select('video_id')
        .limit(1);

    if (pvError) {
        console.log('processed_videos table likely does not exist:', pvError.message);
    } else {
        console.log('processed_videos table exists!');
    }
}

checkTables();
