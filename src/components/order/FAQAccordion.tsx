'use client'

import { useState } from 'react'
import { HelpCircle, Minus, Plus } from 'lucide-react'

const faqs = [
  {
    q: 'Combien de temps ça prend ?',
    a: 'En général 1-2 minutes. Guylian vérifie la disponibilité des ingrédients et valide votre créneau horaire.',
  },
  {
    q: 'Est-ce que je vais recevoir une notification ?',
    a: 'Oui ! Cette page se rafraîchit automatiquement. Dès que votre commande est validée, vous verrez le bouton de paiement apparaître.',
  },
  {
    q: 'Que se passe-t-il si ma commande est refusée ?',
    a: "C'est rare, mais si nous ne pouvons pas honorer votre commande (rupture de stock, créneau complet), vous serez prévenu immédiatement sur cette page.",
  },
  {
    q: 'Mon paiement est-il sécurisé ?',
    a: 'Oui, 100%. Nous utilisons Stripe, la solution de paiement la plus sécurisée au monde. Vos données bancaires ne transitent jamais par notre serveur.',
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
            id={`faq-question-${index}`}
          >
            <span className="flex items-center gap-2 font-medium text-gray-900">
              <HelpCircle size={18} className="text-[#E17B5F] shrink-0" />
              {faq.q}
            </span>
            <span className="text-[#E17B5F] shrink-0" aria-hidden>
              {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
            </span>
          </button>
          <div
            id={`faq-answer-${index}`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 pt-0 text-sm text-gray-600 leading-relaxed">
              {faq.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
