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
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const channels = channelsData as Channel[]

  // ジャンルごとにグループ化
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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full mb-6">
            PREMIUM INTELLIGENCE
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            YouTubeを「読む」<br /><span className="text-slate-500">インテリジェンス・レター</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-8">
            世界中のトップクリエイターの知見を、AIが鋭い切り口の日本語記事へ変換。忙しいあなたの元へ、毎日お届けします。
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <form onSubmit={handleSubscribe} className="space-y-16">

          {/* Email Input - Floating Bar */}
          <div className="sticky top-4 z-50 flex justify-center">
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-2 rounded-2xl shadow-xl flex items-center w-full max-w-xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="メールアドレスを入力"
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-slate-900 font-medium"
              />
              <button
                type="submit"
                disabled={status === 'loading' || selectedChannels.length === 0}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:bg-slate-300 active:scale-95"
              >
                {status === 'loading' ? '処理中...' : '無料で購読'}
              </button>
            </div>
          </div>

          {/* Channels Grid Grouped by Genre */}
          <div className="space-y-16">
            {genres.map(([genre, genreChannels]) => (
              <section key={genre} className="space-y-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-slate-900">{genre}</h2>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {genreChannels.map(channel => (
                    <div
                      key={channel.id}
                      onClick={() => toggleChannel(channel.id)}
                      className={`group relative bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl ${selectedChannels.includes(channel.id)
                          ? 'border-slate-900 ring-4 ring-slate-900/5'
                          : 'border-white hover:border-slate-200'
                        }`}
                    >
                      {/* Thumbnail Container */}
                      <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                        {channel.thumbnail && (
                          <img
                            src={channel.thumbnail}
                            alt={channel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Selected Indicator */}
                        {selectedChannels.includes(channel.id) && (
                          <div className="absolute top-4 right-4 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{channel.name}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
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
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl font-bold animate-bounce ${status === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'
              }`}>
              {message}
            </div>
          )}
        </form>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 text-center">
        <div className="container mx-auto px-4">
          <p className="text-white font-bold mb-4 uppercase tracking-widest text-sm">ReadTube Premium</p>
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</a>
            <span>•</span>
            <span>いつでも配信停止可能</span>
          </div>
          <p className="text-xs">&copy; 2026 ReadTube. Built for entrepreneurs.</p>
        </div>
      </footer>
    </div>
  )
}
