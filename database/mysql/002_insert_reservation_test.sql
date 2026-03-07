-- Réservations de test (à exécuter dans phpMyAdmin sur ta base)
-- Adapte la date si besoin : CURDATE() = aujourd'hui, ou mets une date en 'YYYY-MM-DD'

INSERT INTO reservations (id, client_name, client_phone, reservation_date, reservation_time, guests, notes, status, source)
VALUES
  (UUID(), 'Marie Martin', '+596696123456', CURDATE(), '19:30', 2, 'Table au calme si possible', 'new', 'test'),
  (UUID(), 'Jean-Claude Dupont', '+596696554433', CURDATE(), '20:00', 4, 'Anniversaire', 'confirmed', 'test'),
  (UUID(), 'Sophie Belrose', '0696123456', CURDATE() + INTERVAL 1 DAY, '18:30', 2, NULL, 'new', 'test');

-- Après exécution, rafraîchis l’onglet Réservations dans l’admin (filtre "Aujourd’hui" ou "Toutes").
