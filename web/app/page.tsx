'use client'

import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import channelsData from '../../config/channels.json'

interface Channel {
  id: string
  name: string
  description: string
  genre: string
  thumbnail?: string
  subscribers?: string
  videoCount?: string
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const channels = channelsData as Channel[]

  // Group by genre
  const genres = useMemo(() => {
    const map = new Map<string, Channel[]>()
    channels.forEach(ch => {
      const list = map.get(ch.genre) || []
      list.push(ch)
      map.set(ch.genre, list)
    })
    return Array.from(map.entries())
  }, [channels])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedChannels.length === 0) {
      setMessage('購読するチャンネルを1つ以上選択してください。')
      setStatus('error')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const unsubscribeToken = crypto.randomUUID()

      // UPSERT user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({ email, unsubscribe_token: unsubscribeToken }, { onConflict: 'email' })
        .select()
        .single()

      if (userError) throw userError

      // UPSERT subscriptions
      const subscriptions = selectedChannels.map(channelId => ({
        user_id: userData.id,
        channel_id: channelId
      }))

      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptions, { onConflict: 'user_id,channel_id' })

      if (subError) throw subError

      setStatus('success')
      setMessage('登録完了！最新の動画レポートをお届けします。')
      setEmail('')
      setSelectedChannels([])
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || '登録に失敗しました。')
    }
  }

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white selection:bg-[#FF0000]/30">
      {/* Header / Brand */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-[#FF0000] p-1 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tighter" style={{ fontFamily: '"YouTube Sans", "Roboto", sans-serif' }}>
              ReadTube
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-white/60">YouTubeの知性を、記事として読む</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            世界を変える知見を、<br />
            <span className="text-[#FF0000]">あなたの受信トレイ</span>へ。
          </h1>
          <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-12">
            最新の動画をAIが解析。プロのライターが執筆したような鋭い日本語レポートを配信します。
          </p>

          <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="メールアドレスを入力"
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000] transition-all text-lg"
              />
              <button
                type="submit"
                disabled={status === 'loading' || selectedChannels.length === 0}
                className="bg-white text-black px-10 py-4 rounded-full font-bold hover:bg-[#F2F2F2] transition-all disabled:bg-white/20 disabled:text-white/40 active:scale-95 text-lg"
              >
                無料購読
              </button>
            </div>
            {selectedChannels.length === 0 && (
              <p className="mt-4 text-sm text-[#FF0000]/80">※下の一覧からチャンネルを選択してください</p>
            )}
          </form>
        </div>
      </section>

      {/* Channels Grid */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-16">
          {genres.map(([genre, genreChannels]) => (
            <section key={genre} className="space-y-6">
              <h2 className="text-2xl font-bold px-2 border-l-4 border-[#FF0000]">{genre}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {genreChannels.map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`group relative bg-white/5 border border-transparent rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-white/10 ${selectedChannels.includes(channel.id)
                      ? 'bg-white/15 border-white/20 ring-2 ring-white/50'
                      : ''
                      }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-[16/9] relative overflow-hidden">
                      {channel.thumbnail ? (
                        <img
                          src={channel.thumbnail}
                          alt={channel.name}
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-4xl">📚</div>
                      )}

                      {selectedChannels.includes(channel.id) && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-white text-black rounded-full px-4 py-1 font-bold text-sm">選択済み</div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-white line-clamp-1 group-hover:text-[#FF0000] transition-colors">
                          {channel.name}
                        </h3>
                      </div>
                      <div className="flex gap-2 text-[11px] text-white/40 font-bold uppercase tracking-wider">
                        {channel.subscribers && <span>購読者 {channel.subscribers}</span>}
                        {channel.videoCount && channel.videoCount !== 'NA' && <span>• {channel.videoCount} 動画</span>}
                      </div>
                      <p className="text-white/60 text-xs line-clamp-2 leading-relaxed h-8">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`fixed bottom-8 right-8 z-50 px-8 py-4 rounded-xl shadow-2xl font-bold backdrop-blur-xl border ${status === 'success' ? 'bg-white text-black border-white' : 'bg-[#FF0000] text-white border-[#FF0000]'
            }`}>
            {message}
          </div>
        )}
      </main>

      <footer className="bg-black py-20 text-center border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 mb-6">
            <span className="text-2xl font-black tracking-tighter" style={{ fontFamily: '"YouTube Sans", sans-serif' }}>
              ReadTube
            </span>
          </div>
          <div className="flex justify-center gap-6 mb-8 text-sm text-white/40">
            <a href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <span>•</span>
            <span>いつでも配信停止可能</span>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">&copy; 2026 READTUBE CORE INTELLIGENCE.</p>
        </div>
      </footer>
    </div>
  )
}
