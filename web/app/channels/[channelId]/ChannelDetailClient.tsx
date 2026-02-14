'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import channelsData from '@/data/channels.json'
import { registerUser } from '@/app/actions'

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
    description?: string
    descriptionJa?: string
    subscribers?: string
    persona?: string
}

export default function ChannelDetailClient({ channelId }: { channelId: string }) {
    const [articles, setArticles] = useState<VideoArticle[]>([])
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [subMessage, setSubMessage] = useState('')

    const channels = channelsData as Channel[]
    const channel = channels.find(ch => ch.id === channelId)

    // Related channels (same genre, excluding current)
    const relatedChannels = channels.filter(ch => ch.genre === channel?.genre && ch.id !== channelId).slice(0, 3)

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('videos')
                .select('id, video_id, channel_id, title, summary, content, published_at')
                .eq('channel_id', channelId)
                .order('published_at', { ascending: false })
                .limit(50)

            setArticles(data || [])
            setLoading(false)
        }
        load()
    }, [channelId])

    const getJaTitle = (article: VideoArticle): string => {
        if (article.content) {
            const match = article.content.match(/^#\s+(.+)$/m)
            if (match) return match[1]
        }
        return article.title
    }

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubStatus('loading')
        setSubMessage('')
        try {
            const result = await registerUser(email, [channelId])
            if (result.success) {
                setSubStatus('success')
                setSubMessage('登録完了！確認メールをお送りしました。')
            } else {
                throw new Error(result.message || '登録に失敗しました')
            }
        } catch (err: any) {
            setSubStatus('error')
            setSubMessage(err.message)
        }
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
                    <div className="hidden md:flex items-center gap-4">
                        <a href="/channels" className="text-sm font-bold text-slate-500 hover:text-[#FF0000] transition-colors">チャンネル一覧</a>
                        <span className="text-slate-300">|</span>
                        <a href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-[#FF0000] transition-colors">最新レポート</a>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-14">
                <div className="relative">
                    {/* Hero image */}
                    <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden bg-slate-900">
                        {channel?.thumbnail ? (
                            <img
                                src={channel.thumbnail}
                                alt={channel.name}
                                className="w-full h-full object-cover opacity-40"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

                        {/* Channel info overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-[#FF0000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        {channel?.genre}
                                    </span>
                                    {channel?.subscribers && (
                                        <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                                            {channel.subscribers}人登録
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
                                    {channel?.name}
                                </h1>
                                <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl">
                                    {channel?.descriptionJa || channel?.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscribe CTA */}
            <section className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {subStatus === 'success' ? (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">🎉</div>
                            <p className="text-lg font-bold text-slate-900">{subMessage}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-slate-900 mb-1">
                                    {channel?.name} のAIレポートを受け取る
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    新しい動画が公開されるたびに、AIが自動解析した日本語レポートをメールでお届けします。
                                </p>
                            </div>
                            <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="メールアドレス"
                                    className="flex-1 md:w-64 px-5 py-3 bg-[#F2F2F2] rounded-full outline-none text-sm font-medium focus:ring-2 focus:ring-[#FF0000]/20 focus:bg-white transition-all border border-transparent focus:border-[#FF0000]/30"
                                />
                                <button
                                    type="submit"
                                    disabled={subStatus === 'loading'}
                                    className="bg-[#FF0000] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#CC0000] transition-all shadow-lg shadow-[#FF0000]/20 active:scale-95 disabled:bg-slate-300 whitespace-nowrap"
                                >
                                    {subStatus === 'loading' ? '登録中...' : '無料で購読'}
                                </button>
                            </form>
                        </div>
                    )}
                    {subStatus === 'error' && subMessage && (
                        <p className="mt-3 text-sm font-bold text-[#FF0000] text-center md:text-right">{subMessage}</p>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Articles Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900">
                            最新レポート
                            {!loading && <span className="text-[#FF0000] ml-2 text-lg">({articles.length})</span>}
                        </h2>
                        <a
                            href={`https://www.youtube.com/channel/${channelId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-slate-400 hover:text-[#FF0000] transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                            </svg>
                            YouTubeで見る
                        </a>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#FF0000] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-slate-100">
                            <div className="text-5xl mb-4">📝</div>
                            <p className="text-lg font-bold text-slate-900 mb-2">レポート準備中</p>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                新しい動画が公開されると、AIが自動的にレポートを生成します。<br />
                                購読して最新レポートをお見逃しなく。
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {articles.map(article => (
                                <a
                                    key={article.video_id}
                                    href={`/article/${article.video_id}`}
                                    className="flex gap-4 bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg hover:border-[#FF0000]/20 transition-all group"
                                >
                                    {/* Thumbnail */}
                                    <div className="hidden sm:block w-40 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                        <img
                                            src={`https://img.youtube.com/vi/${article.video_id}/mqdefault.jpg`}
                                            alt={getJaTitle(article)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FF0000] transition-colors leading-snug mb-1.5 line-clamp-2">
                                            {getJaTitle(article)}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-2">
                                            {article.summary?.substring(0, 150)}...
                                        </p>
                                        <time className="text-xs text-slate-400 font-medium">
                                            {article.published_at
                                                ? new Date(article.published_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
                                                : ''}
                                        </time>
                                    </div>

                                    <div className="text-slate-300 group-hover:text-[#FF0000] transition-colors self-center">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Related Channels */}
                {relatedChannels.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">同じジャンルのチャンネル</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedChannels.map(ch => (
                                <a
                                    key={ch.id}
                                    href={`/channels/${ch.id}`}
                                    className="group bg-white rounded-2xl border-2 border-slate-100 overflow-hidden hover:shadow-xl hover:border-slate-200 transition-all duration-300"
                                >
                                    <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                                        {ch.thumbnail ? (
                                            <img
                                                src={ch.thumbnail}
                                                alt={ch.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-50">📚</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 group-hover:text-[#FF0000] transition-colors mb-1">
                                            {ch.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {ch.descriptionJa || ch.description}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Channel Request CTA */}
                <div className="text-center bg-white rounded-3xl border-2 border-slate-100 p-10 mb-16">
                    <div className="text-4xl mb-4">📩</div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">解説してほしいチャンネルはありますか？</h3>
                    <p className="text-slate-500 text-sm mb-6">リクエストいただいたチャンネルは順次追加を検討します。</p>
                    <a
                        href="https://forms.gle/Vus1fFKvrSD78bn87"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-slate-700 transition-all"
                    >
                        📩 チャンネルをリクエスト
                    </a>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 text-center border-t border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center gap-6 text-sm text-slate-400 font-medium flex-wrap">
                        <a href="/" className="hover:text-[#FF0000] transition-colors">トップ</a>
                        <span>•</span>
                        <a href="/channels" className="hover:text-[#FF0000] transition-colors">チャンネル一覧</a>
                        <span>•</span>
                        <a href="/dashboard" className="hover:text-[#FF0000] transition-colors">最新レポート</a>
                        <span>•</span>
                        <a href="https://forms.gle/Vus1fFKvrSD78bn87" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF0000] transition-colors">チャンネルリクエスト</a>
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
