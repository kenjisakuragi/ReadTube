import { Metadata } from 'next'
import channelsData from '@/data/channels.json'
import ChannelDetailClient from './ChannelDetailClient'

interface Channel {
    id: string
    name: string
    genre: string
    thumbnail?: string
    description?: string
    descriptionJa?: string
    subscribers?: string
    persona?: string
}

// Generate all channel pages at build time for SEO
export function generateStaticParams() {
    return (channelsData as Channel[]).map((channel) => ({
        channelId: channel.id,
    }))
}

// SEO metadata for each channel page
export async function generateMetadata({ params }: { params: Promise<{ channelId: string }> }): Promise<Metadata> {
    const { channelId } = await params
    const channels = channelsData as Channel[]
    const channel = channels.find(ch => ch.id === channelId)

    if (!channel) {
        return { title: 'チャンネルが見つかりません | ReadTube' }
    }

    const title = `${channel.name}のAI解析レポート | ReadTube`
    const description = channel.descriptionJa
        || `${channel.name}の最新YouTube動画をAIが毎日解析。忙しいビジネスパーソンのための日本語レポートを無料でお届け。`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: channel.thumbnail ? [{ url: channel.thumbnail }] : [],
            type: 'website',
            siteName: 'ReadTube',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: channel.thumbnail ? [channel.thumbnail] : [],
        },
        alternates: {
            canonical: `https://readtube.jp/channels/${channelId}`,
        },
    }
}

export default async function ChannelDetailPage({ params }: { params: Promise<{ channelId: string }> }) {
    const { channelId } = await params
    return <ChannelDetailClient channelId={channelId} />
}
