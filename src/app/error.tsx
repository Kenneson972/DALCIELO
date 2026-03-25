'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md p-10 sm:p-12 shadow-sm">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-4xl font-black text-[#3D2418] mb-4">
            Une erreur est survenue
          </h1>
          <p className="text-lg text-[#3D2418]/80 mb-8">
            Désolé, quelque chose s&apos;est mal passé. Réessayez ou retournez à l&apos;accueil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" icon={<RefreshCw size={20} />} onClick={reset}>
              Réessayer
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" icon={<Home size={20} />}>
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
