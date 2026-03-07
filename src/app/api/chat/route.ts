import { NextResponse } from 'next/server'
import { checkRateLimit, getIp } from '@/lib/rateLimit'

const N8N_CHATBOT_URL = process.env.N8N_CHATBOT_WEBHOOK_URL ?? ''

interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  if (!N8N_CHATBOT_URL) {
    return NextResponse.json({
      response: 'Le chatbot est momentanément indisponible. Contactez-nous par téléphone au +596 696 88 72 70.',
    })
  }

  const ip = getIp(req)
  if (!checkRateLimit(ip, 20, 60_000)) {
    return NextResponse.json({
      response: 'Vous envoyez trop de messages. Veuillez patienter une minute avant de continuer.',
    })
  }

  try {
    const { message, history } = await req.json()

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({
        response: "Je n'ai pas compris votre message. Pouvez-vous reformuler ?",
      })
    }

    // Formater l'historique pour donner le contexte à DeepSeek
    const recentHistory: HistoryMessage[] = Array.isArray(history)
      ? history.slice(-10)
      : []

    const historyText = recentHistory
      .map((m) => `${m.role === 'user' ? 'Client' : 'CieloBot'}: ${m.content}`)
      .join('\n')

    const chatInput = historyText
      ? `${historyText}\nClient: ${message.trim()}`
      : message.trim()

    const n8nRes = await fetch(N8N_CHATBOT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput }),
      signal: AbortSignal.timeout(30000),
    })

    if (!n8nRes.ok) {
      throw new Error(`n8n responded with ${n8nRes.status}`)
    }

    const data = await n8nRes.json()
    const responseText =
      data.message ||
      data.response ||
      data.text ||
      "Désolé, je n'ai pas pu traiter votre demande."

    const quickReplies =
      Array.isArray(data.quickReplies) && data.quickReplies.length > 0
        ? data.quickReplies
        : undefined

    return NextResponse.json({
      response: responseText,
      ...(quickReplies && { quickReplies }),
      ...(data.trackingUrl && { trackingUrl: data.trackingUrl }),
    })
  } catch (error) {
    console.error('[POST /api/chat] Error:', error)
    return NextResponse.json({
      response:
        'Oups ! Une erreur est survenue. Veuillez nous contacter par téléphone au +596 696 88 72 70.',
    })
  }
}
