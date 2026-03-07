'use client'

/** Icônes optionnelles par mot-clé dans le nom de l'ingrédient */
const INGREDIENT_ICONS: Record<string, string> = {
  base: '🫙',
  mozzarella: '🧀',
  emmental: '🧀',
  fromage: '🧀',
  poulet: '🍗',
  oignon: '🧅',
  olive: '🫒',
  sauce: '🥫',
  tomate: '🍅',
  jambon: '🥓',
  champignon: '🍄',
  poivron: '🫑',
  ananas: '🍍',
  thon: '🐟',
  crevette: '🦐',
  merguez: '🌭',
  viande: '🥩',
  miel: '🍯',
  chèvre: '🧀',
  reblochon: '🧀',
  raclette: '🧀',
  pesto: '🌿',
  basilic: '🌿',
  roquette: '🌿',
  artichaut: '🥬',
  courgette: '🥒',
  aubergine: '🍆',
  frit: '🟡',
  choix: '🫙',
}

function getIcon(ingredient: string): string {
  const lower = ingredient.toLowerCase()
  for (const [key, icon] of Object.entries(INGREDIENT_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return '•'
}

interface ProductDetailTabsProps {
  ingredients: string[]
  isPizzaOrFriand: boolean
  className?: string
}

export function ProductDetailTabs({
  ingredients,
  isPizzaOrFriand,
  className = '',
}: ProductDetailTabsProps) {
  // Suppression de la logique d'onglets pour afficher les ingrédients directement
  
  return (
    <div className={className}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#b07050] mb-3 ml-1">
        Ingrédients
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-7">
        {ingredients.map((ingredient, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 border border-[#ead5c4] rounded-2xl text-sm font-medium text-[#5a3a2a] shadow-sm hover:bg-white hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-300 cursor-default"
          >
            <span className="text-lg leading-none filter drop-shadow-sm">{getIcon(ingredient)}</span>
            <span>{ingredient}</span>
          </span>
        ))}
      </div>

      <div className="text-xs text-[#9a7a65] italic flex items-center gap-2 ml-1 opacity-80">
        <span>ℹ️</span>
        <p>
          Allergènes : demandez en caisse en cas de doute.
        </p>
      </div>
    </div>
  )
}
