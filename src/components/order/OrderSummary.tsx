'use client'

import type { Order } from '@/types/order'

export function OrderSummary({ order }: { order: Order }) {
  const serviceLabel =
    order.type_service === 'click_collect' ? 'Click & Collect' : 'Livraison'

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {order.items.map((item, index) => (
          <div
            key={`${order.id}-${item.id}-${index}`}
            className="flex justify-between text-sm"
          >
            <span className="text-gray-600">
              {item.quantity}× {item.name}
            </span>
            <span className="font-medium">
              {(Number(item.price) * item.quantity).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200" />

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Type</span>
          <span className="font-medium">{serviceLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Heure souhaitée</span>
          <span className="font-medium">
            {order.heure_souhaitee || 'À préciser'}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-[#E17B5F]">
            {Number(order.total).toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  )
}
