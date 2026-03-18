'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  quickReplies?: string[]
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g
function linkify(text: string) {
  const parts = text.split(URL_REGEX)
  return parts.map((part, i) =>
    part.match(URL_REGEX) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noreferrer noopener"
        className="text-primary font-bold underline break-all hover:opacity-80"
      >
        {part}
      </a>
    ) : (
      part
    )
  )
}

const STORAGE_KEY = 'celiobot_session'
const TTL_MS = 24 * 60 * 60 * 1000

const WELCOME: Message = {
  role: 'assistant',
  content: "Bonjour ! 👋 Je suis CieloBot, l'assistant de Pizza dal Cielo. Comment puis-je vous aider aujourd'hui ?"
}

function sanitizeMessages(messages: Message[]): Message[] {
  return messages.map((m) => {
    if (m.role === 'assistant' && m.content.includes('"action":"create_order"')) {
      return { ...m, content: '[Commande créée et envoyée avec succès]', quickReplies: undefined }
    }
    return m
  })
}

function loadSession(): { messages: Message[]; userMessageCount: number; messageTimestamps: number[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return { ...parsed, messages: sanitizeMessages(parsed.messages ?? []) }
  } catch {
    return null
  }
}

type ChatSize = 'full' | 'reduced'

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [chatSize, setChatSize] = useState<ChatSize>('full')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [isLoading, setIsLoading] = useState(false)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false)
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([])
  const [showTooltip, setShowTooltip] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Restore session from localStorage on mount
  useEffect(() => {
    const session = loadSession()
    if (session) {
      setMessages(session.messages)
      setUserMessageCount(session.userMessageCount)
      setMessageTimestamps(session.messageTimestamps)
    }
  }, [])

  // Persist session to localStorage on every message change (JSON brut nettoyé avant stockage)
  useEffect(() => {
    if (messages.length <= 1) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        messages: sanitizeMessages(messages),
        userMessageCount,
        messageTimestamps,
        expiresAt: Date.now() + TTL_MS,
      }))
    } catch {}
  }, [messages, userMessageCount, messageTimestamps])

  // Show tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    const openChat = () => {
      setIsOpen(true)
      setChatSize('reduced')
    }
    window.addEventListener('open-chat', openChat)
    return () => window.removeEventListener('open-chat', openChat)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const MAX_MESSAGES_PER_MINUTE = 5
  const MAX_MESSAGES_PER_SESSION = 200

  const sendToBot = async (messageToSend: string, historyForApi: Message[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, history: historyForApi }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || "Désolé, je n'ai pas pu traiter votre demande. Réessayez plus tard.",
        quickReplies: data.quickReplies?.length ? data.quickReplies : undefined,
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oups ! Une erreur est survenue. Veuillez nous contacter par téléphone.",
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading || rateLimitExceeded) return

    if (userMessageCount >= MAX_MESSAGES_PER_SESSION) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Vous avez atteint la limite de messages pour cette session (${MAX_MESSAGES_PER_SESSION}). Merci d'avoir discuté avec moi !`
      }])
      setInput('')
      return
    }

    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentMessages = messageTimestamps.filter(ts => ts > oneMinuteAgo)

    if (recentMessages.length >= MAX_MESSAGES_PER_MINUTE) {
      setRateLimitExceeded(true)
      setTimeout(() => setRateLimitExceeded(false), 10000)
      return
    }

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setMessageTimestamps(prev => [...prev, now])
    setUserMessageCount(prev => prev + 1)
    setIsLoading(true)
    await sendToBot(userMessage, messages)
  }

  const handleQuickReply = (label: string) => {
    if (isLoading || rateLimitExceeded) return
    if (userMessageCount >= MAX_MESSAGES_PER_SESSION) return
    const last = messages[messages.length - 1]
    const historyForApi =
      last?.role === 'assistant' && last.quickReplies
        ? [...messages.slice(0, -1), { ...last, quickReplies: undefined }]
        : messages
    setMessages([...historyForApi, { role: 'user', content: label }])
    setUserMessageCount(prev => prev + 1)
    setMessageTimestamps(prev => [...prev, Date.now()])
    setIsLoading(true)
    sendToBot(label, historyForApi)
  }

  return (
    <>
      {/* Floating Button Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-24 right-6 z-40 bg-white p-4 rounded-2xl shadow-2xl border border-primary/20 max-w-[200px]"
          >
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-gray-400 hover:text-primary transition-colors"
            >
              <X size={12} />
            </button>
            <p className="text-xs font-bold text-dark leading-tight">
              Besoin d&apos;aide ? Je peux vous conseiller ou prendre votre réservation ! 🍕
            </p>
            <div className="absolute bottom-[-8px] right-6 w-4 h-4 bg-white border-r border-b border-primary/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button — masqué quand le chat est ouvert */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true)
            setChatSize('reduced')
          }}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 overflow-hidden border-2 border-white bg-white"
        >
          <div className="relative w-full h-full">
            <Image 
              src="/images/celiobot.png" 
              alt="CieloBot" 
              fill 
              className="object-cover"
            />
          </div>
        </button>
      )}

      {/* Chat Window — plein écran ou réduit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: chatSize === 'reduced' ? 0.95 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed z-50 bg-white flex flex-col shadow-2xl",
              chatSize === 'full'
                ? "inset-0"
                : "bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[85vh] rounded-[2rem] border border-gray-100 overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="bg-primary p-4 md:p-6 text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-sm shrink-0">
                  <Image 
                    src="/images/celiobot.png" 
                    alt="CieloBot" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm md:text-base uppercase tracking-wider truncate">CieloBot</h3>
                  <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">En ligne • Assistant Pizza</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setChatSize(chatSize === 'full' ? 'reduced' : 'full')}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
                  aria-label={chatSize === 'full' ? 'Réduire' : 'Plein écran'}
                  title={chatSize === 'full' ? 'Réduire' : 'Plein écran'}
                >
                  {chatSize === 'full' ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
                  aria-label="Fermer le chat"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-cream/30">
              <div className={cn("space-y-5", chatSize === 'full' && "max-w-2xl mx-auto")}>
                {messages.map((msg, i) => (
                  <div key={i} className="space-y-2">
                    <div
                      className={cn(
                        "max-w-[88%] px-5 py-4 rounded-2xl text-sm md:text-base leading-[1.6]",
                        msg.role === 'user'
                          ? "bg-primary text-white ml-auto rounded-tr-md rounded-bl-2xl rounded-br-2xl rounded-tl-2xl shadow-md"
                          : "bg-white text-dark shadow-sm rounded-tl-md rounded-br-2xl rounded-bl-2xl rounded-tr-2xl border border-gray-100/80"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.role === 'assistant' ? linkify(msg.content) : msg.content}
                      </p>
                    </div>
                    {msg.role === 'assistant' && msg.quickReplies?.length && i === messages.length - 1 && !isLoading && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {msg.quickReplies.map((label, j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => handleQuickReply(label)}
                            className="px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/30 text-sm font-bold hover:bg-primary/20 active:scale-[0.98] transition-all"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-white text-dark shadow-sm rounded-2xl rounded-tl-md border border-gray-100/80 px-5 py-4 max-w-[88%] flex items-center gap-3">
                    <Loader2 size={18} className="animate-spin text-primary shrink-0" />
                    <span className="text-sm font-bold text-gray-500">CieloBot réfléchit...</span>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 pt-5 bg-white border-t border-gray-100 shrink-0">
              <div className={cn(chatSize === 'full' && "max-w-2xl mx-auto")}>
                {rateLimitExceeded && (
                  <div className="mb-3 text-center text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-widest">
                    Trop de messages ! Attendez quelques secondes...
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Posez votre question..."
                    className="w-full pl-5 pr-14 py-4 rounded-2xl bg-cream/50 border-2 border-gray-100 focus:border-primary/30 focus:outline-none transition-all text-base placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-light disabled:opacity-50 disabled:scale-100 transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">
                  Propulsé par Pizza dal Cielo
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
