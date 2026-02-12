
import axios from 'axios';
import { config } from '../config';

export async function getTranscript(videoId: string): Promise<string | null> {
    if (!config.RAPIDAPI_KEY) {
        console.error("[Transcript] RAPIDAPI_KEY is not set in environment variables.");
        return null;
    }

    console.log(`[Transcript] Fetching from RapidAPI for video: ${videoId}...`);

    try {
        // Using SocialKit YouTube Transcript API (or similar) on RapidAPI
        // Endpoint: https://socialkit-youtube-transcript.p.rapidapi.com/transcript
        const options = {
            method: 'GET',
            url: 'https://socialkit-youtube-transcript.p.rapidapi.com/transcript', // standard endpoint
            params: { videoId: videoId },
            headers: {
                'x-rapidapi-key': config.RAPIDAPI_KEY,
                'x-rapidapi-host': 'socialkit-youtube-transcript.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);

        // Standard SocialKit response format is an array of segments or a joined text
        // [{text: "..."}, {text: "..."}] or {transcript: "..."}
        if (response.data && Array.isArray(response.data)) {
            const fullText = response.data.map((segment: any) => segment.text).join(' ');
            console.log(`  > Successfully retrieved transcript (${fullText.length} chars)`);
            return fullText;
        } else if (response.data && typeof response.data === 'string') {
            return response.data;
        } else if (response.data && response.data.transcript) {
            return response.data.transcript;
        }

        console.error("  > Unexpected response format from RapidAPI:", response.data);
        return null;

    } catch (error: any) {
        console.error(`  > RapidAPI Error for ${videoId}:`, error.response?.data?.message || error.message);
        return null;
    }
}
