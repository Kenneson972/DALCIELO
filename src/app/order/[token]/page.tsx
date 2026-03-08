import { getOrderByToken } from '@/lib/ordersStore'
import { OrderTrackingClient } from '@/components/order/OrderTrackingClient'

export const dynamic = 'force-dynamic'

export default async function OrderTrackingPage({
  params,
}: {
  params: { token: string }
}) {
  let order = null
  try {
    const token = params?.token?.trim()
    if (token) {
      order = await getOrderByToken(token)
    }
  } catch {
    // Erreur serveur (Supabase, etc.) : initialOrder null, le client fera un fetch
  }
  return <OrderTrackingClient initialOrder={order} />
}
