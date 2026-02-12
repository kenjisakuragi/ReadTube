import dotenv from 'dotenv';
dotenv.config();
import { getTranscript } from '../src/services/transcript';
import { generateComprehensiveGuide } from '../src/services/commentator';
import { sendChannelUpdate } from '../src/services/email';
import { renderEmail } from '../src/services/email_renderer';
import { config } from '../src/config';

async function testSend() {
    const videoId = '9sJ2R0rM3CA'; // From Starter Story
    const channelId = 'UChhw6DlKKTQ9mYSpTfXUYqA';
    const channelName = 'Starter Story';
    const videoTitle = 'Testing ReadTube Delivery';
    const persona = 'Expert Business Analyst';

    console.log(`\n📬 Initiating Test Send...`);
    console.log(`--------------------------------------------------`);
    console.log(`Video: ${videoTitle} (${videoId})`);
    console.log(`Target Channel: ${channelName} (${channelId})`);

    try {
        // 1. Get Transcript
        console.log(`[1/4] Fetching transcript...`);
        const transcript = await getTranscript(videoId);
        if (!transcript) throw new Error("Transcript fetch failed");
        console.log(`  > Done.`);

        // 2. Generate Content
        console.log(`[2/4] Generating AI analysis...`);
        const guide = await generateComprehensiveGuide(videoTitle, transcript, persona);
        console.log(`  > Done.`);

        // 3. Render HTML
        console.log(`[3/4] Rendering email template...`);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const html = renderEmail(channelName, videoTitle, guide, videoUrl);
        console.log(`  > Done.`);

        // 4. Send Email
        console.log(`[4/4] Attempting delivery...`);
        if (!config.SMTP_HOST || config.SMTP_USER.includes('your_')) {
            console.log(`  ⚠️  SMTP credentials not configured in .env.`);
            console.log(`  📊 This will run in MOCK MODE.`);
        }

        await sendChannelUpdate(channelId, channelName, videoTitle, html);

        console.log(`--------------------------------------------------`);
        console.log(`✅ Test execution finished.`);
    } catch (err: any) {
        console.error(`\n❌ Error during test:`, err.message);
    }
}

testSend();
