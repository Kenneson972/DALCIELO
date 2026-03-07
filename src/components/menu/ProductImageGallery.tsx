'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
  className?: string
  imageClassName?: string
  priority?: boolean
  badges?: React.ReactNode
  autoplayIntervalMs?: number
  /** Remplir la hauteur du parent (ex. colonne gauche) */
  fillHeight?: boolean
  /** Bandeau horizontal en haut : ratio 2/1, miniatures sous l'image */
  layout?: 'default' | 'banner' | 'sidebar'
  /** Couleur du fond des miniatures (layout banner) */
  thumbnailVariant?: 'light' | 'dark'
}

export function ProductImageGallery({
  images,
  alt,
  className = '',
  imageClassName = '',
  priority,
  badges,
  autoplayIntervalMs = 0,
  fillHeight = false,
  layout = 'default',
  thumbnailVariant = 'light',
}: ProductImageGalleryProps) {
  const [index, setIndex] = useState(0)
  const url = images[index] ?? images[0]
  const hasMultiple = images.length > 1
  const isBanner  = layout === 'banner'
  const isSidebar = layout === 'sidebar'

  const goTo = useCallback((i: number) => setIndex(i), [])
  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  )
  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length]
  )

  useEffect(() => {
    if (!autoplayIntervalMs || images.length <= 1) return
    const t = setInterval(goNext, autoplayIntervalMs)
    return () => clearInterval(t)
  }, [autoplayIntervalMs, images.length, goNext])

  if (!url) return null

  const slideContent = (
    <>
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative min-w-full h-full flex-shrink-0"
          >
            <div
              className={cn(
                'relative w-full h-full',
                isBanner && 'min-h-0',
                !isBanner && (fillHeight ? 'min-h-0' : 'min-h-[300px] md:min-h-[480px]')
              )}
            >
              <Image
                src={src}
                alt={i === index ? alt : ''}
                fill
                className={cn(
                  'object-cover transition-transform duration-[6s] ease-out brightness-[0.92]',
                  i === index ? 'scale-100' : 'scale-[1.05]',
                  imageClassName
                )}
                priority={priority && i === 0}
                sizes={isBanner ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
              />
            </div>
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(26,15,8,0.7), transparent)',
              }}
              aria-hidden
            />
          </div>
        ))}
      </div>

      {badges && (
        <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
          {badges}
        </div>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
            aria-label="Image précédente"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white flex items-center justify-center hover:bg-white/30 hover:scale-105 active:scale-95 transition-all"
            aria-label="Image suivante"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          {!isBanner && (
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent',
                  i === index ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
          )}

          {!isBanner && images.length <= 8 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-2 max-h-[280px] overflow-y-auto py-2">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1a0f08]',
                    i === index
                      ? 'border-white opacity-100 shadow-lg shadow-black/30'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                  aria-label={`Voir image ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {!isBanner && hasMultiple && images.length <= 8 && (
        <div className="md:hidden absolute bottom-14 left-0 right-0 flex justify-center gap-2 px-4 z-10">
          {images.map((img, i) => (
            <button
              key={`thumb-m-${img}-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'relative w-11 h-11 rounded-lg overflow-hidden border-2 transition-all shrink-0',
                i === index ? 'border-white opacity-100 shadow-md' : 'border-white/30 opacity-70'
              )}
              aria-label={`Voir image ${i + 1}`}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
              />
            </button>
          ))}
        </div>
      )}
    </>
  )

  // ── SIDEBAR LAYOUT ─────────────────────────────────────────────────────────
  if (isSidebar) {
    return (
      <div className={cn('flex flex-col h-full bg-[#120c07]', className)}>

        {/* Main image area — fills available height */}
        <div className="relative flex-1 overflow-hidden min-h-[260px] md:min-h-[380px]">
          {images.map((src, i) => (
            <div
              key={`sid-${src}-${i}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-in-out',
                i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              <Image
                src={src}
                alt={i === index ? alt : ''}
                fill
                className={cn(
                  'object-cover transition-transform duration-[6s] ease-out brightness-[0.93]',
                  i === index ? 'scale-100' : 'scale-[1.04]',
                  imageClassName
                )}
                priority={priority && i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ))}

          {/* Bottom gradient */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(18,12,7,0.75), transparent)' }}
            aria-hidden
          />

          {/* Badges */}
          {badges && (
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {badges}
            </div>
          )}

          {/* Counter badge — bottom-right */}
          {hasMultiple && (
            <span className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/90 text-[11px] font-bold tabular-nums select-none tracking-wide">
              {index + 1} / {images.length}
            </span>
          )}

          {/* Arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/60 hover:scale-105 active:scale-95 transition-all"
                aria-label="Image précédente"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/35 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center hover:bg-black/60 hover:scale-105 active:scale-95 transition-all"
                aria-label="Image suivante"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip — dark, compact */}
        {hasMultiple && images.length <= 12 && (
          <div className="flex gap-2 px-4 py-3 bg-[#0d0804] border-t border-white/5 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={`sid-th-${img}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'relative h-14 w-[4.5rem] rounded-xl overflow-hidden border-2 transition-all shrink-0 focus:outline-none',
                  i === index
                    ? 'border-amber-400/70 opacity-100 scale-[1.06] shadow-lg shadow-black/40'
                    : 'border-transparent opacity-35 hover:opacity-75 hover:border-white/20'
                )}
                aria-label={`Voir image ${i + 1}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="72px" />
              </button>
            ))}
          </div>
        )}

        {/* Accent line when single image */}
        {!hasMultiple && <div className="h-[3px] bg-gradient-to-r from-transparent via-amber-700/30 to-transparent shrink-0" />}
      </div>
    )
  }

  // ── BANNER LAYOUT ───────────────────────────────────────────────────────────
  if (isBanner) {
    return (
      <div className={cn('flex flex-col w-full', className)}>
        {/* Image principale — crossfade + subtle ken-burns sur la slide active */}
        <div className="aspect-[4/3] md:aspect-[16/9] relative overflow-hidden bg-[#120c07]">
          {images.map((src, i) => (
            <div
              key={`ban-${src}-${i}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-in-out',
                i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              <Image
                src={src}
                alt={i === index ? alt : ''}
                fill
                className={cn(
                  'object-cover transition-transform duration-[7s] ease-out brightness-[0.93]',
                  i === index ? 'scale-100' : 'scale-[1.04]',
                  imageClassName
                )}
                priority={priority && i === 0}
                sizes="100vw"
              />
              {/* Gradient bas plus enveloppant */}
              <div
                className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(18,12,7,0.72), transparent)' }}
                aria-hidden
              />
            </div>
          ))}

          {/* Badges */}
          {badges && (
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
              {badges}
            </div>
          )}

          {/* Badge compteur n / N — bottom-right */}
          {hasMultiple && (
            <span className="absolute bottom-5 right-5 z-10 px-3 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white/90 text-xs font-bold tabular-nums tracking-wide select-none">
              {index + 1} / {images.length}
            </span>
          )}

          {/* Flèches de navigation */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/55 hover:scale-105 active:scale-95 transition-all"
                aria-label="Image précédente"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-black/55 hover:scale-105 active:scale-95 transition-all"
                aria-label="Image suivante"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* Strip de miniatures */}
        {hasMultiple && images.length <= 12 && (
          <div className={cn(
            'flex gap-2 px-4 py-3 border-t overflow-x-auto scrollbar-hide',
            thumbnailVariant === 'dark'
              ? 'bg-[#0d0804] border-white/5'
              : 'bg-[#fdf6f0] border-[#ead5c4]'
          )}>
            {images.map((img, i) => (
              <button
                key={`ban-th-${img}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'relative w-[4.5rem] h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 focus:outline-none',
                  i === index
                    ? thumbnailVariant === 'dark'
                      ? 'border-amber-400/70 opacity-100 scale-[1.05] shadow-md shadow-black/30'
                      : 'border-primary opacity-100 scale-[1.05] shadow-md shadow-primary/20'
                    : thumbnailVariant === 'dark'
                      ? 'border-transparent opacity-35 hover:opacity-75 hover:border-white/20'
                      : 'border-transparent opacity-55 hover:opacity-90 hover:border-[#e8d0c0]'
                )}
                aria-label={`Voir image ${i + 1}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="72px" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#1a0f08]',
        fillHeight ? 'h-full min-h-0' : 'min-h-[300px] md:min-h-[480px]',
        className
      )}
    >
      {slideContent}
    </div>
  )
}
