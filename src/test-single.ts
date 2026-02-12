
import { getTranscript } from './services/transcript';
import { generateComprehensiveGuide } from './services/commentator';
import { sendChannelUpdate } from './services/email';
import { renderEmail } from './services/email_renderer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function test() {
    const videoId = 'W48emwbUlUE';
    const channelName = 'Starter Story';
    const videoTitle = 'How I Grew My Plugin to $12K/Month';
    const persona = 'Expert Analyst in 副業・ビジネス';

    console.log(`Testing Single Video: ${videoTitle} (${videoId})`);

    // 1. Get Transcript
    const transcript = await getTranscript(videoId);
    if (!transcript) {
        console.error("Failed to get transcript.");
        return;
    }
    console.log("Success: Transcript obtained.");

    // 2. Generate Guide
    console.log("Generating summary with Gemini...");
    const guide = await generateComprehensiveGuide(videoTitle, transcript, persona);

    // 3. Send Email
    console.log("Sending email...");
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const htmlReport = renderEmail(channelName, videoTitle, guide, videoUrl);
    await sendChannelUpdate('UChhw6DlKKTQ9mYSpTfXUYqA', channelName, videoTitle, htmlReport);

    console.log("Test Complete! Check your email.");
}

test().catch(console.error);
