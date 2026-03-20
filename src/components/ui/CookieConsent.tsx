'use client'

import { useEffect } from 'react'
import 'vanilla-cookieconsent/dist/cookieconsent.css'

export function CookieConsent() {
  useEffect(() => {
    import('vanilla-cookieconsent').then((mod) => {
      const cc = mod.default || mod
      cc.run({
        guiOptions: {
          consentModal: {
            layout: 'box inline',
            position: 'bottom left',
          },
        },
        categories: {
          necessary: {
            enabled: true,
            readOnly: true,
          },
        },
        language: {
          default: 'fr',
          translations: {
            fr: {
              consentModal: {
                title: 'Nous utilisons des cookies',
                description:
                  'Ce site utilise uniquement des cookies essentiels au bon fonctionnement du site. Aucun cookie publicitaire ou de suivi n\'est utilisé.',
                acceptAllBtn: 'Accepter',
                acceptNecessaryBtn: 'Refuser',
                showPreferencesBtn: 'Paramétrer',
              },
              preferencesModal: {
                title: 'Paramètres des cookies',
                acceptAllBtn: 'Tout accepter',
                acceptNecessaryBtn: 'Tout refuser',
                savePreferencesBtn: 'Enregistrer',
                sections: [
                  {
                    title: 'Cookies essentiels',
                    description:
                      'Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.',
                    linkedCategory: 'necessary',
                  },
                ],
              },
            },
          },
        },
      })
    })
  }, [])

  return null
}
