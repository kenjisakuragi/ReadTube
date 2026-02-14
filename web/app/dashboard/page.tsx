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
    content: string
    published_at: string
}

interface Channel {
    id: string
    name: string
    genre: string
    thumbnail?: string
}

export default function DashboardPage() {
    const [articles, setArticles] = useState<VideoArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedChannel, setSelectedChannel] = useState<string>('all')

    const channels = channelsData as Channel[]

    useEffect(() => {
        async function load() {
            let query = supabase
                .from('videos')
                .select('id, video_id, channel_id, title, summary, content, published_at')
                .order('published_at', { ascending: false })
                .limit(50)

            if (selectedChannel !== 'all') {
                query = query.eq('channel_id', selectedChannel)
            }

            const { data } = await query
            setArticles(data || [])
            setLoading(false)
        }
        load()
    }, [selectedChannel])

    const getChannelName = (channelId: string) => {
        return channels.find(ch => ch.id === channelId)?.name || channelId
    }

    const getChannelGenre = (channelId: string) => {
        return channels.find(ch => ch.id === channelId)?.genre || ''
    }

    // Extract Japanese title from the AI-generated markdown content
    const getJaTitle = (article: VideoArticle): string => {
        if (article.content) {
            const match = article.content.match(/^#\s+(.+)$/m)
            if (match) return match[1]
        }
        return article.title
    }

    // Group articles by date
    const groupedByDate = articles.reduce((acc, article) => {
        const date = article.published_at
            ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
            : '日付不明'
        if (!acc[date]) acc[date] = []
        acc[date].push(article)
        return acc
    }, {} as Record<string, VideoArticle[]>)

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
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 font-medium hidden md:inline">ダッシュボード</span>
                        <a
                            href="/#pricing"
                            className="bg-[#FF0000] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#CC0000] transition-all shadow-sm"
                        >
                            アップグレード
                        </a>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">最新レポート</h1>
                        <p className="text-slate-500">AIが解析した最新の動画レポートをお読みください。</p>
                    </div>

                    {/* Channel Filter */}
                    <div className="mb-8 overflow-x-auto">
                        <div className="flex gap-2 pb-2">
                            <button
                                onClick={() => setSelectedChannel('all')}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedChannel === 'all'
                                    ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#FF0000]/30'
                                    }`}
                            >
                                すべて
                            </button>
                            {channels.map(ch => (
                                <button
                                    key={ch.id}
                                    onClick={() => setSelectedChannel(ch.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedChannel === ch.id
                                        ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-[#FF0000]/30'
                                        }`}
                                >
                                    {ch.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Articles */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                            <div className="text-5xl mb-4">📭</div>
                            <h2 className="text-xl font-black text-slate-900 mb-2">レポートはまだありません</h2>
                            <p className="text-slate-500">新しい動画が公開されると、自動的にAIレポートが生成されます。</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {Object.entries(groupedByDate).map(([date, dateArticles]) => (
                                <div key={date}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{date}</h2>
                                        <div className="flex-1 h-px bg-slate-200" />
                                    </div>
                                    <div className="grid gap-4">
                                        {dateArticles.map(article => (
                                            <a
                                                key={article.video_id}
                                                href={`/article/${article.video_id}`}
                                                className="block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-[#FF0000]/20 transition-all duration-300 group"
                                            >
                                                <div className="flex flex-col sm:flex-row">
                                                    {/* Thumbnail */}
                                                    <div className="sm:w-48 sm:h-32 w-full h-40 flex-shrink-0 overflow-hidden bg-slate-100">
                                                        <img
                                                            src={`https://img.youtube.com/vi/${article.video_id}/mqdefault.jpg`}
                                                            alt={article.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 p-5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-black text-[#FF0000] bg-[#FF0000]/5 px-2 py-0.5 rounded">
                                                                {getChannelGenre(article.channel_id)}
                                                            </span>
                                                            <span className="text-xs text-slate-400 font-medium truncate">
                                                                {getChannelName(article.channel_id)}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#FF0000] transition-colors leading-snug mb-2">
                                                            {getJaTitle(article)}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                            {article.summary?.substring(0, 200)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 text-center border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center gap-6 text-sm text-slate-400 font-medium">
                        <a href="/" className="hover:text-[#FF0000] transition-colors">トップ</a>
                        <span>•</span>
                        <a href="/privacy" className="hover:text-[#FF0000] transition-colors">プライバシーポリシー</a>
                        <span>•</span>
                        <span>© 2026 ReadTube</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
