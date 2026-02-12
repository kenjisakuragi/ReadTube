// @ts-ignore
import { getSubtitles } from 'youtube-captions-scraper';

async function test() {
    try {
        const videoId = 'M6_V6HqY-OE';
        console.log(`Fetching transcript using youtube-captions-scraper for ${videoId}...`);
        const captions = await (require('youtube-captions-scraper')).getSubtitles({
            videoID: videoId,
            lang: 'en'
        });
        console.log("SUCCESS! Got", captions.length, "lines.");
        console.log("First 100 chars:", captions.map((i: any) => i.text).join(' ').substring(0, 100));
    } catch (e: any) {
        console.error("FAILED:", e.message);
    }
}

test();
