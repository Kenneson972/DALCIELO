'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Pizza, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

export default function SuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen flex items-center justify-center bg-cream/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center"
      >
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-4xl font-black mb-4">Merci !</h1>
        <p className="text-gray-text mb-8">
          Votre commande a été reçue avec succès. 
          Nous commençons à préparer vos pizzas dès maintenant !
        </p>

        <div className="bg-cream/50 p-6 rounded-2xl mb-8 flex items-center gap-4 text-left">
          <div className="bg-primary p-3 rounded-xl text-white">
            <Pizza size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Temps estimé</p>
            <p className="font-black text-dark">25 - 35 minutes</p>
          </div>
        </div>

        <Link href="/">
          <Button className="w-full" icon={<ArrowRight size={18} />}>
            Retour à l&apos;accueil
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
