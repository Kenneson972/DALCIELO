import { getOrderByToken } from '@/lib/ordersStore'
import { OrderTrackingClient } from '@/components/order/OrderTrackingClient'

export const dynamic = 'force-dynamic'

export default async function OrderTrackingPage({
  params,
}: {
  params: { token: string } | Promise<{ token: string }>
}) {
  const { token } = await Promise.resolve(params)
  if (!token?.trim()) {
    return <OrderTrackingClient initialOrder={null} />
  }
  const order = await getOrderByToken(token.trim())
  return <OrderTrackingClient initialOrder={order} />
}
