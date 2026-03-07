'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { MessageCircle, Phone, ShoppingBag, ArrowRight } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

function openCieloBot() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-chat'))
  }
}

const sanitizePhone = (phone: string) => phone.replace(/\D/g, '')
const whatsappUrl = `https://wa.me/${sanitizePhone(contactInfo.whatsapp)}`

export default function CommanderPage() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 text-[#3D2418]"
          >
            Commandez <span className="text-primary">en toute simplicité</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#3D2418]/80 text-lg max-w-2xl mx-auto"
          >
            Choisissez la méthode qui vous convient le mieux pour passer commande.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1 — CieloBot */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-full flex flex-col border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-black text-xl mb-3 text-[#3D2418]">Avec CieloBot</h3>
              <p className="text-[#3D2418]/70 text-sm mb-6 flex-1">
                Discutez avec notre assistant pour composer votre commande, ajouter au panier et valider. Rapide et guidé.
              </p>
              <Button
                onClick={openCieloBot}
                className="w-full"
                icon={<MessageCircle size={20} />}
              >
                Ouvrir CieloBot
              </Button>
            </Card>
          </motion.div>

          {/* Option 2 — Téléphone */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="p-8 h-full flex flex-col border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Phone size={28} />
              </div>
              <h3 className="font-black text-xl mb-3 text-[#3D2418]">Par téléphone</h3>
              <p className="text-[#3D2418]/70 text-sm mb-6 flex-1">
                Appelez-nous directement pour passer commande. Mardi au samedi, 18h – 22h.
              </p>
              <a href={`tel:${sanitizePhone(contactInfo.phone)}`}>
                <Button
                  className="w-full"
                  icon={<Phone size={20} />}
                >
                  {contactInfo.phone}
                </Button>
              </a>
            </Card>
          </motion.div>

          {/* Option 3 — WhatsApp */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 h-full flex flex-col border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 flex items-center justify-center mb-6 text-[#25D366]">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-black text-xl mb-3 text-[#3D2418]">Sur WhatsApp</h3>
              <p className="text-[#3D2418]/70 text-sm mb-6 flex-1">
                Envoyez-nous un message pour commander ou poser vos questions. Réponse rapide garantie.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  className="w-full bg-[#25D366] hover:bg-[#20BD5A] border-0"
                  icon={<MessageCircle size={20} />}
                >
                  Ouvrir WhatsApp
                </Button>
              </a>
            </Card>
          </motion.div>

          {/* Option 4 — Site (menu + panier) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-8 h-full flex flex-col border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-black text-xl mb-3 text-[#3D2418]">Sur le site</h3>
              <p className="text-[#3D2418]/70 text-sm mb-6 flex-1">
                Parcourez le menu, ajoutez vos pizzas au panier et validez en ligne. Paiement sécurisé.
              </p>
              <Link href="/menu">
                <Button
                  className="w-full"
                  icon={<ArrowRight size={20} />}
                >
                  Voir le menu
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[#3D2418]/60 text-sm mt-10"
        >
          Horaires : Mardi – Samedi, 18h – 22h
        </motion.p>
      </div>
    </div>
  )
}
