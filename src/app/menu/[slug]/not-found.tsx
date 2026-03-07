import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 px-6 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-12 shadow-2xl">
          <div className="text-6xl mb-6">🍕</div>
          <h1 className="text-4xl font-black text-[#3D2418] mb-4">
            Produit introuvable
          </h1>
          <p className="text-lg text-[#3D2418]/80 mb-8">
            Désolé, ce produit n&apos;existe pas ou a été retiré du menu.
          </p>
          <Link href="/menu">
            <Button variant="primary" size="lg" icon={<ArrowLeft size={20} />}>
              Retour au menu
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
