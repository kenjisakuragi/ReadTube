'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { processUnsubscribe } from '../actions'

export default function UnsubscribePage() {
    const params = useParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('') // Adding message state for error details

    useEffect(() => {
        const unsubscribe = async () => {
            const token = params.token as string

            // Call the server action
            const result = await processUnsubscribe(token)

            if (result.success) {
                setEmail(result.email)
                setStatus('success')
            } else {
                setMessage(result.message)
                setStatus('error')
            }
        }

        unsubscribe()
    }, [params.token])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto mb-4"></div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">処理中...</h1>
                        <p className="text-slate-600">配信停止の手続きを行っています</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-6xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">配信を停止しました</h1>
                        <p className="text-slate-600 mb-6">
                            {email} 宛のメール配信を停止しました。
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            ご利用ありがとうございました。またのご利用をお待ちしております。
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-slate-900 text-white py-2 px-6 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            トップページに戻る
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">エラーが発生しました</h1>
                        <p className="text-slate-600 mb-6">
                            配信停止の処理に失敗しました。URLが正しいかご確認ください。
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-slate-900 text-white py-2 px-6 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            トップページに戻る
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
