
import axios from 'axios';
import { config } from '../config';

export async function getTranscript(videoId: string): Promise<string | null> {
    if (!config.RAPIDAPI_KEY) {
        console.error("[Transcript] RAPIDAPI_KEY is not set in environment variables.");
        return null;
    }

    console.log(`[Transcript] Fetching from RapidAPI (youtube-transcript3) for: ${videoId}...`);

    try {
        const options = {
            method: 'GET',
            url: 'https://youtube-transcript3.p.rapidapi.com/api/transcript-with-videoid',
            params: {
                videoId: videoId,
                flat_text: 'true',
                lang: 'en' // Default to English as the source content is mostly English
            },
            headers: {
                'x-rapidapi-key': config.RAPIDAPI_KEY,
                'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);

        // This API with flat_text=true typically returns { transcript: "...", ... } 
        // or just the string depending on version. Let's handle both.
        if (response.data) {
            const transcript = response.data.transcript || response.data;
            if (typeof transcript === 'string' && transcript.length > 50) {
                console.log(`  > Successfully retrieved transcript (${transcript.length} chars)`);
                return transcript;
            }
        }

        console.error("  > Unexpected response format from RapidAPI:", response.data);
        return null;

    } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error(`  > RapidAPI Error for ${videoId}:`, errorMsg);
        return null;
    }
}
