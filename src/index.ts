import { checkNewVideos } from './services/rss';
import { getTranscript } from './services/transcript';
import { generateComprehensiveGuide } from './services/commentator';
import { sendChannelUpdate } from './services/email';
import { renderEmail } from './services/email_renderer';
import { Channel } from './config';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Load channels config
const channelsConfigPath = path.join(__dirname, '../config/channels.json');
const channels: Channel[] = JSON.parse(fs.readFileSync(channelsConfigPath, 'utf-8'));

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials (SUPABASE_URL or SUPABASE_SERVICE_KEY).");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Starting ReadTube polling...");

    for (const channel of channels) {
        console.log(`Checking channel: ${channel.name} (${channel.id})`);
        const newVideos = await checkNewVideos(channel.id);

        for (const video of newVideos) {
            /*
            const { data: existing } = await supabase
                .from('processed_videos')
                .select('video_id')
                .eq('video_id', video.id)
                .single();

            if (existing) {
                continue;
            }
            */

            console.log(`Found new video: ${video.title}`);

            // 1. Get Transcript
            const transcript = await getTranscript(video.id);
            if (!transcript) {
                console.log(`  - No transcript found. Skipping.`);
                continue;
            }

            // 2. Generate Guide
            console.log(`  - Generating Comprehensive Guide (Persona: ${channel.persona})...`);
            const guide = await generateComprehensiveGuide(video.title, transcript, channel.persona);

            // 3. Render and Send Email
            console.log(`  - Rendering and Sending Email...`);
            const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
            const htmlReport = renderEmail(channel.name, video.title, guide, videoUrl);

            const baseUrl = process.env.BASE_URL;
            await sendChannelUpdate(channel.id, channel.name, video.title, htmlReport, baseUrl);

            // 4. Save to Database (Web Content & Logs)
            console.log(`  - Saving to Database...`);

            // Insert into 'videos' table for the web portal
            await supabase.from('videos').insert({
                video_id: video.id,
                channel_id: channel.id,
                title: video.title,
                content: guide, // The full Markdown report
                transcript: transcript.startsWith('GEMINI_AUDIO_URI') ? null : transcript,
                summary: guide.substring(0, 500), // Brief excerpt
                status: 'published',
                published_at: video.pubDate ? new Date(video.pubDate).toISOString() : new Date().toISOString()
            });

            // Mark as processed
            await supabase.from('processed_videos').insert({
                video_id: video.id,
                channel_id: channel.id,
                title: video.title,
                status: 'success'
            });
            console.log(`  - Done.`);
        }
    }

    console.log("Polling complete.");
}

// Run main
main().catch(err => console.error(err));
