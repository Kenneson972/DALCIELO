'use client'

import React from 'react'
import Link from 'next/link'
import { contactInfo } from '@/data/menuData'

export default function MentionsPage() {
  const { name, owner, address, phone, email } = contactInfo

  return (
    <div className="pt-28 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-[#3D2418] mb-8">Mentions légales</h1>
        <p className="text-[#3D2418]/80 mb-10">
          Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique,
          voici les informations relatives à l&apos;éditeur et à l&apos;hébergement du site.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">1. Éditeur du site</h2>
          <p className="text-[#3D2418]/90 leading-relaxed">
            <strong>{name}</strong><br />
            Exploitant : {owner}<br />
            {address.street}<br />
            {address.postalCode} {address.city}, {address.state}
          </p>
          <p className="mt-3">
            Téléphone : <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-primary font-semibold hover:underline">{phone}</a><br />
            Email : <a href={`mailto:${email}`} className="text-primary font-semibold hover:underline">{email}</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">2. Hébergement</h2>
          <p className="text-[#3D2418]/90 leading-relaxed">
            Ce site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">vercel.com</a>
          </p>
          <p className="text-sm text-[#3D2418]/70 mt-2">
            (À adapter si l&apos;hébergement est différent en production.)
          </p>
        </section>

        <section className="mb-10" id="cookies">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">3. Cookies</h2>
          <p className="text-[#3D2418]/90 leading-relaxed">
            Ce site peut utiliser des cookies techniques nécessaires au fonctionnement (panier, préférences).
            Aucun cookie publicitaire ou de traçage tiers n&apos;est déposé sans votre consentement.
            Si des outils d&apos;analyse (ex. Google Analytics) sont ajoutés ultérieurement, un bandeau de consentement vous permettra de choisir vos préférences.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">4. Données personnelles</h2>
          <p className="text-[#3D2418]/90 leading-relaxed">
            Les données collectées lors d&apos;une commande (nom, téléphone, adresse le cas échéant) sont utilisées uniquement pour traiter et livrer votre commande.
            Elles ne sont pas cédées à des tiers à des fins commerciales. Vous pouvez nous contacter pour exercer vos droits (accès, rectification, suppression).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">5. Propriété intellectuelle</h2>
          <p className="text-[#3D2418]/90 leading-relaxed">
            L&apos;ensemble du contenu de ce site (textes, images, logo) est protégé par le droit d&apos;auteur et appartient à {name} ou à ses partenaires. Toute reproduction non autorisée est interdite.
          </p>
        </section>

        <p className="text-sm text-[#3D2418]/60 mt-12">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
