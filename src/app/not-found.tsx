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
            Page introuvable
          </h1>
          <p className="text-lg text-[#3D2418]/80 mb-8">
            Désolé, cette page n&apos;existe pas. Retournez à l&apos;accueil ou découvrez notre menu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg" icon={<ArrowLeft size={20} />}>
                Retour à l&apos;accueil
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg">
                Voir le menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
