import Parser from 'rss-parser';

const parser = new Parser();

export interface VideoItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    id: string; // Video ID
}

export async function checkNewVideos(channelId: string): Promise<VideoItem[]> {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        const feed = await parser.parseURL(feedUrl);
        const videos: VideoItem[] = feed.items.map(item => {
            const videoId = item.id?.split(':')[2] || '';
            return {
                title: item.title || '',
                link: item.link || '',
                pubDate: item.pubDate || '',
                contentSnippet: item.contentSnippet,
                id: videoId
            };
        }).filter(v => v.id !== '');

        return videos;
    } catch (error) {
        console.error(`Error fetching RSS for channel ${channelId}:`, error);
        return [];
    }
}
