import { afterEach, describe, expect, it, vi } from 'vitest'
import { getDeliveryFeeForAddress, PIZZERIA_LAT, PIZZERIA_LNG } from './deliveryFee'

function banResponse(features: Array<{
  coordinates: [number, number]
  label: string
  citycode: string
  score: number
}>) {
  return {
    ok: true,
    json: async () => ({
      features: features.map((f) => ({
        geometry: { coordinates: f.coordinates },
        properties: {
          label: f.label,
          citycode: f.citycode,
          score: f.score,
        },
      })),
    }),
  }
}

describe('getDeliveryFeeForAddress', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('adresse pizzeria (même point que l’origine BAN) → distance ~0 et 3 € (zone 1)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url).includes('api-adresse.data.gouv.fr')) {
          return banResponse([
            {
              coordinates: [PIZZERIA_LNG, PIZZERIA_LAT],
              label: '146 Boulevard de la Pointe des Nègres 97200 Fort-de-France',
              citycode: '97209',
              score: 0.95,
            },
          ]) as Response
        }
        throw new Error(`fetch inattendu: ${url}`)
      }),
    )

    const r = await getDeliveryFeeForAddress(
      '146 Bd De La Pointe Des Nègres, Fort-de-France 97200',
    )
    expect(r).toMatchObject({ fee: 3 })
    if ('fee' in r && r.fee != null) {
      expect(r.distanceKm).toBeLessThan(0.05)
    }
  })

  it('2 Avenue des Caneficiers, 97200 Fort-de-France → proche (zone 1), pas 4 €', async () => {
    const nearLat = 14.61081
    const nearLng = -61.084346
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: RequestInfo | URL) => {
        if (String(url).includes('api-adresse.data.gouv.fr')) {
          return banResponse([
            {
              coordinates: [nearLng, nearLat],
              label: 'Avenue des Caneficiers 97200 Fort-de-France',
              citycode: '97209',
              score: 0.93,
            },
          ]) as Response
        }
        throw new Error(`fetch inattendu: ${url}`)
      }),
    )

    const r = await getDeliveryFeeForAddress('2 Avenue des Caneficiers, 97200 Fort-de-France')
    expect(r).toMatchObject({ fee: 3 })
    if ('fee' in r && r.fee != null) {
      expect(r.fee).toBe(3)
      expect(r.distanceKm).toBeLessThan(1)
    }
  })
})
