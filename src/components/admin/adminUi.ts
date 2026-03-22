/**
 * Tokens Tailwind partagés — dashboard admin (UI uniquement).
 * Utiliser avec `cn()` pour fusionner avec des classes locales.
 */

/** Anneau focus visible (accessibilité clavier) */
export const adminFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

export const adminFocusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

/** Carte standard contenu principal */
export const adminCard =
  'rounded-2xl border border-slate-200/90 bg-white shadow-sm'

/** Carte cliquable / survol */
export const adminCardInteractive =
  'rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md'

/** Label de section (surtitre) */
export const adminSectionLabel =
  'text-[11px] font-bold uppercase tracking-wider text-slate-500'

/** Titre de bloc secondaire */
export const adminHeadingSm = 'text-base font-semibold text-slate-900 tracking-tight'

/** Champ texte principal (mobile ≥16px) */
export const adminInput =
  'min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300'

export const adminInputFocus = `${adminInput} ${adminFocusRing}`

/** Bouton primaire marque */
export const adminBtnPrimary =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-coral to-burnt-orange px-5 text-sm font-semibold text-white shadow-sm transition hover:brightness-[1.03] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none'

/** Bouton secondaire */
export const adminBtnSecondary =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-50'

/** Bouton fantôme / lien */
export const adminBtnGhost =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'

/** Badge neutre */
export const adminBadge =
  'inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600'

/** Zone page contenu (fond) */
export const adminPageBg = 'min-h-screen min-h-[100dvh] bg-slate-100/90'

/** Barre d’outils chips (sync, statut) */
export const adminToolbarChip =
  'inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm'
