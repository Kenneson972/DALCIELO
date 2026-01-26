'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Phone, MapPin, Mail, Instagram, Facebook, Clock, Send } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black mb-6">Nous <span className="text-primary">Contacter</span></h1>
          <p className="text-gray-text text-lg max-w-2xl mx-auto">
            Une question ? Une réservation de groupe ? Ou tout simplement envie de dire bonjour ? 
            Nous sommes à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="bg-primary/10 p-4 rounded-xl text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">Notre Adresse</h3>
                  <p className="text-gray-text text-sm leading-relaxed">
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
                  <h3 className="font-black text-lg mb-2">Téléphone</h3>
                  <a href={`tel:${contactInfo.phone}`} className="text-gray-text text-sm hover:text-primary transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-4 rounded-xl text-primary">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg mb-2">Email</h3>
                  <a href={`mailto:${contactInfo.email}`} className="text-gray-text text-sm hover:text-primary transition-colors">
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

          {/* Contact Form Placeholder / Google Maps */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 h-full min-h-[500px] flex flex-col">
              <h3 className="font-black text-2xl mb-8">Envoyez-nous un <span className="text-primary">message</span></h3>
              <form className="space-y-6 flex-grow" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Nom Complet</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-cream/50 border border-gray-100 focus:outline-none focus:border-primary transition-all" placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Email</label>
                    <input type="email" className="w-full px-6 py-4 rounded-2xl bg-cream/50 border border-gray-100 focus:outline-none focus:border-primary transition-all" placeholder="votre@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-gray-400">Message</label>
                  <textarea rows={6} className="w-full px-6 py-4 rounded-2xl bg-cream/50 border border-gray-100 focus:outline-none focus:border-primary transition-all resize-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                </div>
                <Button className="w-full md:w-auto" icon={<Send size={18} />}>
                  Envoyer le Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Map Integration (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[3rem] overflow-hidden h-[450px] shadow-2xl relative"
        >
          {/* Using a placeholder for map, in production replace with Google Maps Embed */}
          <div className="absolute inset-0 bg-gray-200 flex flex-col items-center justify-center">
             <MapPin size={48} className="text-primary mb-4 animate-bounce" />
             <p className="font-bold text-gray-500">Google Maps - Bellevue, Fort-de-France</p>
             <p className="text-gray-400 text-sm mt-2">Cliquez pour ouvrir dans Google Maps</p>
             <a 
              href="https://www.google.com/maps/search/Pizza+dal+Cielo+Bellevue+Fort-de-France" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 bg-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary hover:text-white transition-all"
             >
               Ouvrir la Carte
             </a>
          </div>
          {/* For real implementation: 
          <iframe 
            src="https://www.google.com/maps/embed?..." 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy"
          ></iframe> 
          */}
        </motion.div>
      </div>
    </div>
  )
}
