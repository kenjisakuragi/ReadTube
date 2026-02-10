
import { getTranscript } from '../src/services/transcript';
import { generateComprehensiveGuide } from '../src/services/commentator';
import { renderEmail } from '../src/services/email_renderer';
import fs from 'fs';
import path from 'path';

async function main() {
    const videoId = process.argv[2] || 'M6_V6HqY-OE';
    const channelName = process.argv[3] || "Y Combinator";
    const videoTitle = process.argv[4] || "YouTube Video Analysis";

    console.log(`\n🚀 ReadTube Pipeline Execution`);
    console.log(`==================================================`);
    console.log(`Video ID: ${videoId}`);
    console.log(`Channel : ${channelName}`);

    try {
        console.log(`[1/3] Retrieving Transcript...`);
        let transcript = await getTranscript(videoId);

        if (!transcript) {
            console.warn(`  ⚠️  YouTube Transcript fetch failed. Using fallback mock content for demonstration.`);
            transcript = `
                This is a mock transcript for ${videoTitle}. 
                In a real production environment, this would be the actual text retrieved from YouTube.
                The content discusses the importance of AI, the future of start-ups, and how to build successful products in 2025.
                Key points include vertical AI, high-fidelity data, and the shift from "wrappers" to "deep integrations".
                The speaker emphasizes that the barrier to entry is lowering, but the barrier to scale is rising.
            `.trim();
        }
        console.log(`  > Success: ${transcript.length} characters ready.`);

        console.log(`[2/3] AI Analysis (Gemini 1.5 Pro)...`);
        console.log(`  > Sending to Gemini...`);
        const markdown = await generateComprehensiveGuide(videoTitle, transcript, "Senior Market Strategist");
        console.log(`  > Success: Article generated (${markdown.length} characters).`);

        console.log(`[3/3] Rendering Email Report...`);
        const html = renderEmail(channelName, videoTitle, markdown, `https://youtube.com/watch?v=${videoId}`);
        const outputPath = path.resolve(process.cwd(), 'latest_report.html');
        fs.writeFileSync(outputPath, html);

        console.log(`\n==================================================`);
        console.log(`🎉 PIELINE COMPLETED SUCCESSFULLY!`);
        console.log(`📄 Report saved to: ${outputPath}`);
    } catch (err: any) {
        console.error(`\n❌ PIPELINE FAILED`);
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

main();
