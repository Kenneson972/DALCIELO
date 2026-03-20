import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md p-10 sm:p-12 shadow-sm">
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
