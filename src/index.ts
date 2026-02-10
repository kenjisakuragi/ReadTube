import { checkNewVideos } from './services/rss';
import { getTranscript } from './services/transcript';
import { generateComprehensiveGuide } from './services/commentator';
import { sendChannelUpdate } from './services/email';
import { renderEmail } from './services/email_renderer';
import { Channel } from './config';
import fs from 'fs';
import path from 'path';

// Load channels config
const channelsConfigPath = path.join(__dirname, '../config/channels.json');
const channels: Channel[] = JSON.parse(fs.readFileSync(channelsConfigPath, 'utf-8'));

// State file to track processed videos
const stateFilePath = path.join(__dirname, '../data/processed_videos.json');
let processedVideos: string[] = [];

if (fs.existsSync(stateFilePath)) {
    processedVideos = JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
}

async function main() {
    console.log("Starting ReadTube polling...");

    for (const channel of channels) {
        console.log(`Checking channel: ${channel.name} (${channel.id})`);
        const newVideos = await checkNewVideos(channel.id);

        for (const video of newVideos) {
            if (processedVideos.includes(video.id)) {
                continue;
            }

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

            await sendChannelUpdate(channel.name, video.title, htmlReport);

            // 4. Update State
            processedVideos.push(video.id);
            if (!fs.existsSync(path.dirname(stateFilePath))) {
                fs.mkdirSync(path.dirname(stateFilePath), { recursive: true });
            }
            fs.writeFileSync(stateFilePath, JSON.stringify(processedVideos, null, 2));
            console.log(`  - Done.`);
        }
    }

    console.log("Polling complete.");
}

// Run main
main().catch(err => console.error(err));
