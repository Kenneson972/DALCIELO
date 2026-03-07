-- Reservations table - compatible MySQL 5.7 (o2switch)
-- Si ta version est 8+, prefere 001_create_reservations.sql

CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  client_name VARCHAR(120) NOT NULL,
  client_phone VARCHAR(24) NOT NULL,

  reservation_date DATE NOT NULL,
  reservation_time CHAR(5) NOT NULL,
  guests TINYINT UNSIGNED NOT NULL,
  notes TEXT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'new',
  refused_reason VARCHAR(255) NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'n8n',
  confirmed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL
);

CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_phone ON reservations(client_phone);

-- Pas d'index unique en 5.7 : les doublons sont geres dans l'app (findActiveDuplicate).
-- Statuts attendus : new, confirmed, refused, arrived, cancelled
