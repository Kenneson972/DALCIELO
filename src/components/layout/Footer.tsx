import React from 'react'
import Link from 'next/link'
import { Pizza, Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react'
import { contactInfo } from '@/data/menuData'

export const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Pizza className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-white">
              DAL CIELO
            </span>
          </Link>
          <p className="text-white/60 leading-relaxed">
            Des pizzas artisanales authentiques au cœur de Fort-de-France. 
            Une expérience gustative qui vous rapproche du ciel.
          </p>
          <div className="flex gap-4">
            <a 
              href={contactInfo.socials.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-primary transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a 
              href={contactInfo.socials.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 p-3 rounded-full hover:bg-primary transition-colors"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Navigation</h3>
          <ul className="space-y-4">
            <li><Link href="/" className="text-white/60 hover:text-primary transition-colors">Accueil</Link></li>
            <li><Link href="/menu" className="text-white/60 hover:text-primary transition-colors">Notre Menu</Link></li>
            <li><Link href="/about" className="text-white/60 hover:text-primary transition-colors">À Propos</Link></li>
            <li><Link href="/contact" className="text-white/60 hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Contact</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-white/60">
              <MapPin className="text-primary shrink-0" size={20} />
              <span>{contactInfo.address.street}, {contactInfo.address.city}, {contactInfo.address.state}</span>
            </li>
            <li className="flex items-center gap-3 text-white/60">
              <Phone className="text-primary shrink-0" size={20} />
              <a href={`tel:${contactInfo.phone}`} className="hover:text-primary transition-colors">{contactInfo.phone}</a>
            </li>
            <li className="flex items-center gap-3 text-white/60">
              <Mail className="text-primary shrink-0" size={20} />
              <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">{contactInfo.email}</a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Horaires</h3>
          <ul className="space-y-3">
            {contactInfo.hours.map((h) => (
              <li key={h.day} className="flex justify-between text-white/60 text-sm">
                <span>{h.day}</span>
                <span className={h.hours === 'Fermé' ? 'text-red-400' : 'text-white/80 font-medium'}>
                  {h.hours}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} Pizza dal Cielo. Tous droits réservés. Design tropical par Cursor.</p>
      </div>
    </footer>
  )
}
