'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import channelsData from '@/data/channels.json'

interface VideoArticle {
    id: number
    video_id: string
    channel_id: string
    title: string
    summary: string
    published_at: string
}

interface Channel {
    id: string
    name: string
    genre: string
}

export default function ChannelArticlesPage({ params }: { params: Promise<{ channelId: string }> }) {
    const [articles, setArticles] = useState<VideoArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [channelId, setChannelId] = useState<string>('')

    const channels = channelsData as Channel[]

    useEffect(() => {
        async function load() {
            const resolvedParams = await params
            setChannelId(resolvedParams.channelId)

            const { data } = await supabase
                .from('videos')
                .select('id, video_id, channel_id, title, summary, published_at')
                .eq('channel_id', resolvedParams.channelId)
                .order('published_at', { ascending: false })
                .limit(50)

            setArticles(data || [])
            setLoading(false)
        }
        load()
    }, [params])

    const channel = channels.find(ch => ch.id === channelId)

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-1">
                        <div className="bg-[#FF0000] p-1 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-[#0F0F0F]">ReadTube</span>
                    </a>
                </div>
            </header>

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Channel Header */}
                    <div className="mb-12">
                        <a href="/" className="text-sm text-[#FF0000] font-bold hover:underline mb-4 inline-block">← チャンネル一覧</a>
                        <h1 className="text-3xl font-black text-slate-900">{channel?.name || channelId}</h1>
                        {channel?.genre && (
                            <span className="inline-block mt-3 text-xs font-black uppercase tracking-widest text-[#FF0000] bg-[#FF0000]/5 px-3 py-1 rounded-full">
                                {channel.genre}
                            </span>
                        )}
                    </div>

                    {/* Articles */}
                    {articles.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-lg font-bold">このチャンネルの記事はまだありません</p>
                            <p className="text-sm mt-2">新しい動画が公開されると、自動的にレポートが生成されます。</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {articles.map(article => (
                                <a
                                    key={article.video_id}
                                    href={`/article/${article.video_id}`}
                                    className="block bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-[#FF0000]/20 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#FF0000] transition-colors leading-snug mb-2">
                                                {article.title}
                                            </h2>
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                {article.summary?.substring(0, 150)}...
                                            </p>
                                            <time className="text-xs text-slate-400 mt-3 block font-medium">
                                                {article.published_at
                                                    ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
                                                    : ''}
                                            </time>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-[#FF0000] transition-colors mt-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
