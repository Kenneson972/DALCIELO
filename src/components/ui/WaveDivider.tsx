'use client'

interface WaveDividerProps {
  /** Couleur de remplissage de la vague (ex: "#FFF8F0" ou "white") */
  fill?: string
  /** Inverser la vague horizontalement */
  flip?: boolean
  /** Classe CSS supplémentaire */
  className?: string
}

/**
 * Séparateur SVG en forme de vague douce entre les sections.
 * Place-le entre deux sections pour créer une transition fluide.
 */
export function WaveDivider({ fill = '#FFF8F0', flip = false, className = '' }: WaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${className}`}
      aria-hidden="true"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <svg
        viewBox="0 0 1440 60"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-[40px] md:h-[60px]"
      >
        <path
          d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1380,20 1440,30 L1440,60 L0,60 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}
