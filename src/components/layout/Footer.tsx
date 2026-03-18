'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, Facebook, Phone, MapPin, MessageCircle, ArrowUp, CreditCard } from 'lucide-react'
import { contactInfo } from '@/data/menuData'
import { Button } from '@/components/ui/Button'

export const Footer = () => {
  const sanitizePhone = (phone: string) => phone.replace(/\D/g, '')

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-gradient-to-br from-[#E17B5F] to-[#D4633F] text-white pt-32 px-6 overflow-hidden mt-20 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      
      {/* Wave Separator Top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white/10"></path>
            <path d="M985.66,92.83c-81.47-20.45-168.36-61.76-241.82-78.64C661.54,1.8,575.74,2.81,493.35,19.53,435.5,31.26,379.34,50.6,321.39,61.39,243.54,75.87,163.73,83.48,93.68,65L0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-cream mix-blend-overlay opacity-30"></path>
        </svg>
      </div>

      {/* Palm Trees Background */}
      <div className="absolute bottom-0 left-0 w-full h-64 opacity-10 pointer-events-none select-none">
        <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
          <path d="M100,300 Q150,150 200,300 T300,300 T400,300" fill="currentColor" opacity="0.5" />
          <path d="M500,300 Q550,100 600,300 T700,300" fill="currentColor" opacity="0.7" />
          <path d="M800,300 Q900,50 1000,300 T1200,300" fill="currentColor" opacity="0.6" />
          <circle cx="100" cy="100" r="50" fill="currentColor" opacity="0.2" /> {/* Moon/Sun hint */}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <img
                src="/images/logo.png"
                alt="Pizza dal Cielo Logo"
                className="h-12 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90 drop-shadow-md"
              />
              <div className="flex flex-col">
                <span className="font-display font-black text-2xl tracking-tight text-white leading-none">
                  DAL CIELO
                </span>
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Pizzeria Artisanale</span>
              </div>
            </Link>

            <p className="text-white/80 leading-relaxed">
              Le goût authentique de l'Italie sous le soleil de Martinique.
              Des produits frais, une pâte faite main, et beaucoup d'amour.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity w-fit"
              >
                <MessageCircle size={20} />
                Commander par WhatsApp
              </a>
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-3 bg-white/20 text-white px-5 py-3 rounded-2xl font-bold hover:bg-white/30 transition-colors w-fit"
              >
                <Phone size={20} />
                {contactInfo.phone}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b-2 border-white/20 pb-2 inline-block">Navigation</h3>
            <ul className="space-y-4">
              {['Accueil', 'Notre Menu', 'Commander', 'À Propos', 'Contact'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Accueil' ? '/' : item === 'Notre Menu' ? '/menu' : item === 'Commander' ? '/commander' : `/${item.toLowerCase().replace(/ /g, '')}`}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all hover:translate-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 group-hover:bg-white transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold border-b-2 border-white/20 pb-2 inline-block">Nous trouver</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 text-white/90 group">
                <div className="bg-white/20 p-2 rounded-lg mt-1 group-hover:bg-white/30 transition-colors">
                  <MapPin size={20} />
                </div>
                <span>
                  <strong className="block text-lg mb-1">Bellevue</strong>
                  {contactInfo.address.street}<br />
                  {contactInfo.address.city}, {contactInfo.address.postalCode}
                </span>
              </li>
              <li className="flex items-center gap-4 text-white/90 group">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Phone size={20} />
                </div>
                <a href={`tel:${sanitizePhone(contactInfo.phone)}`} className="text-lg font-bold hover:underline">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-4 text-white/90 group">
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Mail size={20} />
                </div>
                <a href={`mailto:${contactInfo.email}`} className="hover:underline">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Hours */}
          <div className="space-y-8">
            <div className="inline-block bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-3xl p-6 shadow-xl w-full">
              <p className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                🕐 Horaires
              </p>
              <div className="space-y-1">
                <p className="text-white/90 text-sm">Mardi - Samedi</p>
                <p className="text-white text-3xl font-black">18h - 22h</p>
                <p className="text-white/60 text-xs mt-2 pt-2 border-t border-white/20">Fermé Dimanche & Lundi</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center md:justify-start">
              <a 
                href={contactInfo.socials.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white text-[#D4633F] p-3 rounded-2xl hover:scale-110 transition-transform shadow-lg"
              >
                <Instagram size={24} />
              </a>
              <a 
                href={contactInfo.socials.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white text-[#D4633F] p-3 rounded-2xl hover:scale-110 transition-transform shadow-lg"
              >
                <Facebook size={24} />
              </a>
              <a 
                href={`https://wa.me/${sanitizePhone(contactInfo.whatsapp)}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#25D366] text-white p-3 rounded-2xl hover:scale-110 transition-transform shadow-lg"
              >
                <MessageCircle size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white/60 text-sm">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <p>© {new Date().getFullYear()} Pizza dal Cielo. Fait avec ❤️ en Martinique.</p>
            <span className="hidden md:inline">·</span>
            <Link href="/mentions" className="hover:text-white transition-colors">Mentions légales</Link>
            <span className="hidden md:inline">·</span>
            <Link href="/mentions#cookies" className="hover:text-white transition-colors">Cookies</Link>
            <span className="hidden md:inline">·</span>
            <a href="https://karibloom.net" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Site créé par Karibloom</a>
          </div>
          
          {/* Payment Icons Placeholder */}
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-widest font-bold opacity-70">Paiement sécurisé</span>
            <div className="flex gap-2 opacity-80">
              <div className="bg-white/10 p-1.5 rounded-lg"><CreditCard size={20} /></div>
              <div className="bg-white/10 p-1.5 rounded-lg font-bold text-xs flex items-center px-2">VISA</div>
              <div className="bg-white/10 p-1.5 rounded-lg font-bold text-xs flex items-center px-2">CB</div>
            </div>
          </div>

          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-white transition-colors group"
          >
            Retour en haut
            <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
              <ArrowUp size={16} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  )
}
