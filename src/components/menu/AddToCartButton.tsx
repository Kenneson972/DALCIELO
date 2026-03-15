'use client'

import { Button } from '@/components/ui/Button'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { PizzaOptionsModal } from '@/components/menu/PizzaOptionsModal'
import { MenuItem } from '@/lib/menuUtils'
import { useState } from 'react'

interface AddToCartButtonProps {
  item: MenuItem
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AddToCartButton({ item, size = 'lg', className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)

  const category =
    item.category ||
    (item.type === 'drink' ? 'Boissons' : item.type === 'friand' ? 'Friands' : 'Pizzas')

  const handleAddToCart = () => {
    if (item.type === 'pizza' || item.varianteChoix) {
      setOptionsOpen(true)
      return
    }
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleOptionsAdd = ({
    customizations,
    totalPrice,
    supplements,
  }: {
    customizations: string[]
    totalPrice: number
    supplements: Array<{ id: number; name: string; price: number }>
  }) => {
    const suppTotal = supplements.reduce((sum, s) => sum + s.price, 0)
    const allCustomizations = [...customizations]
    if (supplements.length > 0) {
      allCustomizations.push(`Suppléments: ${supplements.map(s => s.name).join(', ')}`)
    }
    addItem({
      id: item.id,
      name: item.name,
      price: totalPrice + suppTotal,
      image: item.image,
      category,
      customizations: allCustomizations,
    })
    setOptionsOpen(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <PizzaOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        pizza={{
          id: item.id,
          name: item.name,
          price: item.price,
          category,
          image: item.image,
          sauceAuChoix: item.sauceAuChoix,
          varianteChoix: item.varianteChoix,
        }}
        onAdd={handleOptionsAdd}
      />
      <Button
        onClick={handleAddToCart}
        variant="primary"
        size={size}
        className={`w-full ${className || ''}`}
        icon={<ShoppingBag size={size === 'sm' ? 14 : 20} />}
      >
        {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
      </Button>
    </>
  )
}
