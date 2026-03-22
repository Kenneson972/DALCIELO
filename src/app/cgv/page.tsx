import React from 'react'
import Link from 'next/link'

export default function CgvPage() {
  return (
    <div className="pt-28 pb-24 px-6 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-[#3D2418] mb-4">
          Conditions Générales de Vente
        </h1>
        <p className="text-[#3D2418]/60 text-sm mb-10">Dernière mise à jour : mars 2026</p>

        {/* 1 — Vendeur */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">1. Identification du vendeur</h2>
          <div className="text-[#3D2418]/85 leading-relaxed space-y-1">
            <p><strong>Raison sociale :</strong> SAS PIZZA DAL CIELO</p>
            <p><strong>Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
            <p><strong>SIREN :</strong> 944 450 774</p>
            <p><strong>SIRET (siège) :</strong> 944 450 774 00012</p>
            <p><strong>TVA intracommunautaire :</strong> FR85944450774</p>
            <p><strong>Gérant :</strong> Guylian Grangenois</p>
            <p><strong>Adresse :</strong> 146 Bd de la Pointe des Nègres, 97200 Fort-de-France, Martinique</p>
            <p><strong>Téléphone :</strong>{' '}
              <a href="tel:+596696887270" className="text-primary font-semibold hover:underline">
                +596 696 88 72 70
              </a>
            </p>
            <p><strong>Email :</strong>{' '}
              <a href="mailto:contact@pizzadalcielo.com" className="text-primary font-semibold hover:underline">
                contact@pizzadalcielo.com
              </a>
            </p>
            <p><strong>Site web :</strong>{' '}
              <a href="https://pizzadalcielo.com" className="text-primary font-semibold hover:underline">
                pizzadalcielo.com
              </a>
            </p>
          </div>
        </section>

        {/* 2 — Objet */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">2. Objet et champ d&apos;application</h2>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent toutes les commandes passées
            via le site <strong>pizzadalcielo.com</strong> par tout client (ci-après « le Client »)
            souhaitant commander des pizzas et boissons auprès de la SAS PIZZA DAL CIELO
            (ci-après « le Vendeur »). Toute commande implique l&apos;acceptation pleine et entière
            des présentes CGV.
          </p>
        </section>

        {/* 3 — Produits */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">3. Produits et prix</h2>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Les produits proposés à la vente sont des denrées alimentaires fraîches (pizzas artisanales,
            boissons et accompagnements) préparées à la commande.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). Le Vendeur se réserve le
            droit de modifier ses prix à tout moment ; les produits sont facturés sur la base des tarifs
            en vigueur au moment de la validation de la commande.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Les photographies et descriptifs des produits sont fournis à titre indicatif et n&apos;ont
            pas de valeur contractuelle.
          </p>
        </section>

        {/* 4 — Commande */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">4. Processus de commande</h2>
          <ol className="list-decimal list-inside text-[#3D2418]/85 leading-relaxed space-y-2">
            <li>Le Client sélectionne les produits souhaités et les ajoute à son panier.</li>
            <li>Il renseigne ses coordonnées (prénom, nom, numéro de téléphone).</li>
            <li>Il procède au paiement en ligne sécurisé via Stripe.</li>
            <li>Une confirmation de commande est envoyée par SMS/WhatsApp et un reçu est accessible en ligne.</li>
            <li>Le Vendeur confirme la prise en charge de la commande et communique un délai de préparation estimé.</li>
          </ol>
          <p className="text-[#3D2418]/85 leading-relaxed mt-3">
            Le Vendeur se réserve le droit de refuser ou d&apos;annuler toute commande en cas
            d&apos;indisponibilité d&apos;un produit, de fermeture exceptionnelle ou de force majeure.
            En cas d&apos;annulation après paiement, le Client est intégralement remboursé.
          </p>
        </section>

        {/* 5 — Paiement */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">5. Paiement</h2>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Le règlement s&apos;effectue intégralement en ligne, au moment de la commande, via la
            plateforme de paiement sécurisé <strong>Stripe</strong> (carte bancaire Visa, Mastercard).
            Les données bancaires du Client sont chiffrées et ne sont jamais stockées sur les serveurs
            du Vendeur.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Toute commande est ferme et définitive dès validation du paiement. Aucun paiement en
            espèces ni à la livraison n&apos;est accepté via ce canal.
          </p>
        </section>

        {/* 6 — Retrait */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">6. Retrait sur place</h2>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Pizza Dal Cielo propose exclusivement le <strong>retrait sur place</strong> (click &amp; collect).
            Aucune livraison à domicile n&apos;est assurée par le Vendeur.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Adresse de retrait : <strong>146 Bd de la Pointe des Nègres, 97200 Fort-de-France</strong>.
            Le délai de préparation estimé est communiqué lors de la confirmation de commande. Les
            commandes non retirées dans un délai raisonnable (30 minutes après la fin de préparation)
            pourront être considérées comme abandonnées, sans remboursement.
          </p>
        </section>

        {/* 7 — Rétractation */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">7. Droit de rétractation</h2>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation
            ne s&apos;applique pas aux contrats portant sur la fourniture de <strong>biens susceptibles
            de se détériorer ou de se périmer rapidement</strong>, ce qui est le cas des denrées
            alimentaires fraîches. Toute commande validée et payée est donc ferme et ne peut être
            annulée que par le Vendeur dans les cas décrits à l&apos;article 4.
          </p>
        </section>

        {/* 8 — Réclamations */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">8. Réclamations et remboursements</h2>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Toute réclamation concernant un produit (erreur de commande, défaut de conformité) doit
            être signalée <strong>au moment du retrait ou dans les 2 heures suivant la réception</strong>,
            par téléphone au{' '}
            <a href="tel:+596696887270" className="text-primary font-semibold hover:underline">
              +596 696 88 72 70
            </a>{' '}
            ou par email à{' '}
            <a href="mailto:contact@pizzadalcielo.com" className="text-primary font-semibold hover:underline">
              contact@pizzadalcielo.com
            </a>.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed">
            En cas de réclamation fondée, le Vendeur proposera soit un remplacement du produit, soit
            un remboursement partiel ou total selon la nature du litige.
          </p>
        </section>

        {/* 9 — Responsabilité */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">9. Responsabilité</h2>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Le Vendeur s&apos;engage à préparer les commandes avec soin et en respectant les règles
            d&apos;hygiène alimentaire applicables. Sa responsabilité ne saurait toutefois être
            engagée en cas de force majeure, d&apos;événements hors de son contrôle (rupture
            d&apos;approvisionnement, coupure de courant, intempéries, etc.) ou d&apos;une mauvaise
            conservation du produit après retrait par le Client.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Le Client est seul responsable de l&apos;exactitude des informations fournies lors de la
            commande (coordonnées, allergènes à signaler, etc.).
          </p>
        </section>

        {/* 10 — Données personnelles */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">10. Données personnelles</h2>
          <p className="text-[#3D2418]/85 leading-relaxed mb-3">
            Les données collectées (prénom, nom, téléphone) sont utilisées exclusivement pour le
            traitement et le suivi de la commande. Elles ne sont ni revendues ni cédées à des tiers.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679),
            le Client dispose d&apos;un droit d&apos;accès, de rectification et de suppression de
            ses données en contactant le Vendeur à l&apos;adresse email indiquée à l&apos;article 1.
            Pour plus d&apos;informations, consultez nos{' '}
            <Link href="/mentions" className="text-primary font-semibold hover:underline">
              mentions légales
            </Link>.
          </p>
        </section>

        {/* 11 — Loi applicable */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D2418] mb-4">11. Loi applicable et juridiction</h2>
          <p className="text-[#3D2418]/85 leading-relaxed">
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
            sera recherchée en priorité. À défaut, le différend sera porté devant les tribunaux
            compétents de <strong>Fort-de-France (Martinique)</strong>.
          </p>
          <p className="text-[#3D2418]/85 leading-relaxed mt-3">
            Conformément à l&apos;article L.616-1 du Code de la consommation, le Client peut
            recourir gratuitement à un médiateur de la consommation en cas de litige non résolu.
          </p>
        </section>

        <div className="border-t border-[#3D2418]/10 pt-8 mt-10">
          <Link href="/" className="text-primary font-semibold hover:underline text-sm">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
