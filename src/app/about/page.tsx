'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Wheat, Flame, Leaf, Clock, Sparkles, ChefHat } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <Wheat className="text-primary" size={28} />,
    title: 'La pâte, pétrie chaque jour',
    description:
      'Rien n\'est préparé à l\'avance. La pâte est pétrie chaque soir avant le service, laissée à lever lentement pour développer ses arômes. Légère, croustillante en dessous, moelleuse à l\'intérieur — c\'est la base de tout.',
  },
  {
    number: '02',
    icon: <Leaf className="text-primary" size={28} />,
    title: 'Des ingrédients choisis avec soin',
    description:
      'Mozzarella fondante, tomates goûteuses, viandes de qualité, herbes fraîches. Pas de compromis sur les ingrédients — chaque produit est sélectionné pour ce qu\'il apporte au goût final.',
  },
  {
    number: '03',
    icon: <Flame className="text-primary" size={28} />,
    title: 'La cuisson, une question de précision',
    description:
      'Le four tourne à haute température pour saisir la pâte en quelques minutes. Le résultat : une croûte bien dorée, des garnitures fondantes, et ce petit croustillant en fin de bouchée qu\'on ne retrouve nulle part ailleurs.',
  },
  {
    number: '04',
    icon: <Clock className="text-primary" size={28} />,
    title: 'Préparée à la commande, jamais à l\'avance',
    description:
      'Chaque pizza est assemblée au moment où vous commandez. Pas de pizza réchauffée, pas de stock. Ce que vous recevez sort du four directement pour vous.',
  },
  {
    number: '05',
    icon: <Sparkles className="text-primary" size={28} />,
    title: 'La pizza du chef, une créa tous les 15 jours',
    description:
      'Tous les 15 jours, une nouvelle recette exclusive sort du four. C\'est l\'occasion de tenter des associations inédites, de surprendre, et de montrer que la pizza n\'a pas de limites.',
  },
  {
    number: '06',
    icon: <ChefHat className="text-primary" size={28} />,
    title: 'Un seul maître à bord',
    description:
      "L'équipe de Dal Cielo fait tout — la pâte, les garnitures, la cuisson. Ce n'est pas une chaîne, c'est une pizzeria artisanale. Ça se voit dans chaque pizza.",
  },
]

/** Panneau lisible sur fond photo (contraste WCAG-friendly, reste léger vs mega-bloc) */
const readablePanel =
  'rounded-[1.75rem] sm:rounded-[2rem] border border-white/50 bg-white/82 backdrop-blur-md shadow-sm'

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
          {/* Hero — texte dans un panneau verre ; image reste sur le fond */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-20 lg:mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className={`${readablePanel} p-8 sm:p-10`}
            >
              <p className="text-primary font-bold uppercase tracking-[0.2em] text-sm mb-4">Notre savoir-faire</p>
              <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight text-[#2c1a12]">
                Comment on fait <br />
                <span className="text-primary">nos pizzas</span>
              </h1>
              <p className="text-lg text-[#2c1a12]/90 leading-relaxed mb-6">
                Chez Pizza Dal Cielo, il n&apos;y a pas de secret industriel ni de recette achetée.
                Juste du travail, de bons produits, et une vraie passion pour la pizza artisanale.
              </p>
              <p className="text-lg text-[#2c1a12]/90 leading-relaxed">
                Voici exactement comment chaque pizza qui sort de notre four est préparée —
                de la pâte pétrie le soir même jusqu&apos;à la garniture posée à la commande.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/about-team.jpg"
                  alt="Pizza Dal Cielo — artisanat et passion"
                  width={700}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-md px-8 py-6 rounded-3xl shadow-xl hidden md:block border border-gray-100">
                <p className="text-primary font-black text-3xl mb-1">5.0 ★</p>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">TripAdvisor</p>
              </div>
            </motion.div>
          </div>

          {/* Étapes — cartes avec fond lisible */}
          <div>
            <div className={`${readablePanel} text-center mb-10 sm:mb-12 px-6 py-10 sm:px-10 max-w-3xl mx-auto`}>
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-[#2c1a12]">
                De la farine à <span className="text-primary">votre table</span>
              </h2>
              <p className="text-[#2c1a12]/85 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                6 étapes qui font la différence entre une pizza ordinaire et une pizza Dal Cielo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex gap-6 p-7 sm:p-8 ${readablePanel} hover:border-primary/30 hover:shadow-md hover:bg-white/90 transition-all group`}
                >
                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-primary/12 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      {step.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-primary font-black text-xs uppercase tracking-widest mb-1">{step.number}</p>
                    <h3 className="text-xl font-black text-[#2c1a12] mb-3">{step.title}</h3>
                    <p className="text-[#2c1a12]/85 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
      </div>
    </div>
  )
}
