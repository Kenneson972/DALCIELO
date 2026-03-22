import { orderingBlockReason } from '@/lib/ordering'

/** Bandeau discret : fermeture dim. & lun. — placé sous le hero (pas au-dessus du site). */
export function ClosedDayOrderingBanner() {
  const reason = orderingBlockReason()
  if (!reason) return null

  const isSunday = reason === 'sunday'

  return (
    <div
      className="w-full border-y border-[#3D2418]/10 bg-[#3D2418]/[0.06] backdrop-blur-sm text-[#3D2418] text-center text-sm sm:text-base font-semibold py-3 px-4"
      role="status"
      aria-live="polite"
    >
      {isSunday ? (
        <>
          <span className="inline-block mr-1.5" aria-hidden>
            🔒
          </span>
          Fermeture le <strong>dimanche</strong> et le <strong>lundi</strong> — commande en ligne à partir de{' '}
          <strong>mardi</strong> (18h–22h).
        </>
      ) : (
        <>
          <span className="inline-block mr-1.5" aria-hidden>
            🔒
          </span>
          Fermeture le <strong>lundi</strong> — commande en ligne à partir de <strong>mardi</strong> (18h–22h).
        </>
      )}
    </div>
  )
}
