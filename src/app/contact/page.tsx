'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Phone, MapPin, Mail, Clock, MessageCircle } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

function openCieloBot() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-chat'))
  }
}

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 shadow-2xl mb-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-[#3D2418]">Nous <span className="text-primary">Contacter</span></h1>
            <p className="text-[#3D2418]/80 text-lg max-w-2xl mx-auto">
              Une question ? Une réservation de groupe ? Ou tout simplement envie de dire bonjour ? 
              Nous sommes à votre écoute.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-8">
                <div className="flex items-start gap-4 mb-8">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-2 text-[#3D2418]">Notre Adresse</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {contactInfo.address.street}<br />
                      {contactInfo.address.city}, {contactInfo.address.state}<br />
                      {contactInfo.address.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-8">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-2 text-[#3D2418]">Téléphone</h3>
                    <a href={`tel:${contactInfo.phone}`} className="text-gray-500 text-sm hover:text-primary transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-2 text-[#3D2418]">Email</h3>
                    <a href={`mailto:${contactInfo.email}`} className="text-gray-500 text-sm hover:text-primary transition-colors">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-dark text-white">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                  <Clock className="text-primary" size={20} /> Horaires d&apos;Ouverture
                </h3>
                <div className="space-y-3">
                  {contactInfo.hours.map((h) => (
                    <div key={h.day} className="flex justify-between text-sm">
                      <span className="text-white/60">{h.day}</span>
                      <span className={h.hours === 'Fermé' ? 'text-primary/80' : 'font-bold'}>{h.hours}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* CTA CieloBot — questions, réservations, etc. */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 md:p-10 h-full min-h-[320px] flex flex-col justify-center">
                <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <MessageCircle size={32} className="text-primary" />
                  </div>
                  <h3 className="font-black text-2xl md:text-3xl mb-4 text-[#3D2418]">
                    Une question ? Parlez à <span className="text-primary">CieloBot</span>
                  </h3>
                  <p className="text-[#3D2418]/70 mb-8 leading-relaxed">
                    Réservations, horaires, menu ou simple demande : notre assistant vous répond en direct. Cliquez ci-dessous pour ouvrir le chat.
                  </p>
                  <Button
                    onClick={openCieloBot}
                    className="w-full md:w-auto min-h-[48px]"
                    icon={<MessageCircle size={20} />}
                  >
                    Ouvrir CieloBot
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Google Maps - affichage automatique */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[3rem] overflow-hidden h-[450px] shadow-2xl relative border-4 border-white/50"
        >
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              `${contactInfo.name}, ${contactInfo.address.street}, ${contactInfo.address.city} ${contactInfo.address.postalCode}, ${contactInfo.address.state}`
            )}&output=embed&z=17`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pizza dal Cielo - Localisation"
            className="w-full h-full min-h-[450px]"
          />
        </motion.div>
      </div>
    </div>
  )
}
