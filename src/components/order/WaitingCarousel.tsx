'use client'

import { useState, useEffect } from 'react'

const INSTAGRAM_HANDLE = 'pizza_dal_cielo'

const contentBlocks = [
  {
    icon: '💡',
    title: 'Le saviez-vous ?',
    text: 'Nos pizzas sont préparées avec une pâte à maturation lente de 48h. C\'est ce qui leur donne ce goût unique et cette texture légère.',
    link: undefined as string | undefined,
    linkLabel: undefined as string | undefined,
  },
  {
    icon: '🌱',
    title: 'Notre engagement',
    text: 'Tomates locales, mozzarella artisanale, basilic du jardin. Zéro compromis sur la qualité.',
    link: undefined as string | undefined,
    linkLabel: undefined as string | undefined,
  },
  {
    icon: '⭐',
    title: 'Avis clients',
    text: 'Découvrez les avis de nos clients sur TripAdvisor.',
    link: 'https://www.tripadvisor.fr/Restaurant_Review-g147328-d28103311-Reviews-Pizza_Dal_Cielo-Fort_de_France_Arrondissement_of_Fort_de_France_Martinique.html',
    linkLabel: 'Voir les avis',
  },
  {
    icon: '📸',
    title: 'Suivez-nous sur Instagram',
    text: 'Découvrez nos coulisses et nos pizzas du moment.',
    link: `https://instagram.com/${INSTAGRAM_HANDLE}`,
    linkLabel: undefined as string | undefined,
  },
]

export function WaitingCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % contentBlocks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-[180px] overflow-hidden">
      {contentBlocks.map((block, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={index !== activeIndex}
        >
          <div className="text-center px-2">
            <div className="text-4xl mb-2" aria-hidden>{block.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {block.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{block.text}</p>
            {block.link && (
              <a
                href={block.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E17B5F] to-[#D4633F] text-white text-sm font-bold hover:opacity-95 transition-opacity"
              >
                {(block as { linkLabel?: string }).linkLabel ?? 'Suivre'}
              </a>
            )}
          </div>
        </div>
      ))}

      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pt-4">
        {contentBlocks.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'bg-[#E17B5F] w-6'
                : 'bg-gray-300 w-2 hover:bg-gray-400'
            }`}
            aria-label={`Voir le bloc ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </div>
  )
}
