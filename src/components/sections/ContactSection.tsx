'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Phone, MapPin, Clock, Instagram } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

export const ContactSection = () => {
  return (
    <section className="py-24 px-6 bg-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl mb-6 text-[#3D2418]">Prêt à <span className="text-primary">commander</span> ?</h2>
          <p className="text-[#3D2418]/90 text-lg">
            Venez nous voir à Bellevue ou appelez-nous pour passer votre commande. 
            On s&apos;occupe du reste !
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Card 1: Visit Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-10 h-full flex flex-col items-center text-center hover:border-primary/20 border-2 border-transparent bg-white/55 backdrop-blur-sm max-md:bg-white/92 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#3D2418]">Nous trouver</h3>
              <p className="text-[#3D2418]/90 leading-relaxed">
                {contactInfo.address.street}<br />
                {contactInfo.address.city}, {contactInfo.address.state}<br />
                {contactInfo.address.postalCode}
              </p>
              <div className="mt-8">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contactInfo.address.street}, ${contactInfo.address.city}, ${contactInfo.address.state}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="text-primary">Voir sur Maps</Button>
                </a>
              </div>
            </Card>
          </motion.div>

          {/* Contact Card 2: Call Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-10 h-full flex flex-col items-center text-center bg-primary text-white shadow-primary/20 border-0">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-black mb-4">Appeler</h3>
              <p className="text-white/80 leading-relaxed mb-8">
                Pour toute commande ou information,<br />
                contactez-nous directement :
              </p>
              <a href={`tel:${contactInfo.phone}`} className="text-3xl font-sans font-black hover:scale-105 transition-transform">
                {contactInfo.phone}
              </a>
              <div className="mt-8">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  WhatsApp
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Contact Card 3: Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-10 h-full flex flex-col items-center text-center hover:border-primary/20 border-2 border-transparent bg-white/55 backdrop-blur-sm max-md:bg-white/92 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-black mb-4 text-[#3D2418]">Horaires</h3>
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#3D2418]/80">Mardi - Samedi</span>
                  <span className="font-bold">18:00 - 22:00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#3D2418]/80">Dimanche - Lundi</span>
                  <span className="font-bold text-primary">Fermé</span>
                </div>
              </div>
              <div className="mt-12 flex gap-4">
                <a href={contactInfo.socials.instagram} className="text-[#3D2418]/80 hover:text-primary transition-colors">
                  <Instagram size={24} />
                </a>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Google Maps - affichage automatique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/30 h-[300px] md:h-[450px]"
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
            title="Pizza Dal Cielo - Localisation"
            className="w-full h-full min-h-[450px]"
          />
        </motion.div>
      </div>
    </section>
  )
}
