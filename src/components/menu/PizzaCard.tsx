import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pizza, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'

interface PizzaCardProps {
  pizza: {
    id: number
    name: string
    price: number | null
    ingredients?: string[]
    image?: string
    popular?: boolean
    vegetarian?: boolean
    premium?: boolean
    category?: string
    description?: string
    type?: string
  }
}

export const PizzaCard = ({ pizza }: PizzaCardProps) => {
  const { addItem } = useCart()

  const isPizza = !pizza.type || pizza.type === 'Pizza' || pizza.type === 'Chef'

  return (
    <Card className="h-full flex flex-col group overflow-hidden">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img 
          src={pizza.image || (isPizza 
            ? "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop" 
            : pizza.type === 'Drink' 
              ? "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=800&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1601050690597-df056fbec7ad?q=80&w=800&auto=format&fit=crop"
          )} 
          alt={pizza.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {pizza.popular && <Badge text="Populaire" variant="popular" />}
          {pizza.vegetarian && <Badge text="Veggie" variant="vegetarian" />}
          {pizza.premium && <Badge text="Premium" variant="premium" />}
          {pizza.category && <Badge text={pizza.category} variant="popular" className={cn(pizza.category === 'Classique' ? 'bg-blue-400' : 'bg-primary')} />}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-3">
          <h3 className="text-xl font-black group-hover:text-primary transition-colors">{pizza.name}</h3>
          {pizza.price && <span className="text-primary font-accent font-bold text-lg whitespace-nowrap">{pizza.price}€</span>}
        </div>
        <p className="text-gray-text text-sm mb-4 line-clamp-3">
          {pizza.ingredients ? pizza.ingredients.join(', ') : pizza.description || (pizza.type === 'Drink' ? 'Bouteille 50cl' : '')}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <Button 
            onClick={() => pizza.price && addItem({ id: pizza.id, name: pizza.name, price: pizza.price, image: pizza.image })}
            variant="primary" 
            size="sm" 
            className="flex-grow text-xs"
            icon={<ShoppingBag size={14} />}
            disabled={!pizza.price}
          >
            Ajouter
          </Button>
          {isPizza && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
              <Pizza size={12} className="text-primary" />
              Artisanal
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
