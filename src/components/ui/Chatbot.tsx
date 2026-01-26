'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Pizza, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Bonjour ! 👋 Je suis CieloBot, l'assistant de Pizza dal Cielo. Comment puis-je vous aider aujourd'hui ?"
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false)
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([])
  const [showTooltip, setShowTooltip] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Show tooltip after 5 seconds
    const timer = setTimeout(() => {
      if (!isOpen) setShowTooltip(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const MAX_MESSAGES_PER_MINUTE = 5
  const MAX_MESSAGES_PER_SESSION = 20

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await response.json()
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || "Désolé, je n'ai pas pu traiter votre demande. Réessayez plus tard." 
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Oups ! Une erreur est survenue. Veuillez nous contacter par téléphone." 
      }])
    } finally {
      setIsLoading(false)
    }
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

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95",
          isOpen ? "bg-dark text-white" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Pizza size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">CieloBot</h3>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">En ligne • Assistant Pizza</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-cream/30">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-primary text-white ml-auto rounded-tr-none"
                      : "bg-white text-dark shadow-sm rounded-tl-none border border-gray-100"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="bg-white text-dark shadow-sm rounded-2xl rounded-tl-none border border-gray-100 p-4 max-w-[85%] flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs font-bold text-gray-400">CieloBot réfléchit...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              {rateLimitExceeded && (
                <div className="mb-2 text-center text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-widest">
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
                  className="w-full pl-6 pr-14 py-4 rounded-2xl bg-cream/50 border-2 border-transparent focus:border-primary/20 focus:outline-none transition-all text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-light disabled:opacity-50 disabled:scale-100 transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-3 uppercase tracking-widest font-bold">
                Propulsé par Pizza dal Cielo
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
