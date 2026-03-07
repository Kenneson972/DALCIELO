-- Reservations table for o2switch MySQL
-- Compatible with MySQL 8+

CREATE TABLE IF NOT EXISTS reservations (
  id CHAR(36) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  client_name VARCHAR(120) NOT NULL,
  client_phone VARCHAR(24) NOT NULL,

  reservation_date DATE NOT NULL,
  reservation_time CHAR(5) NOT NULL, -- HH:mm
  guests TINYINT UNSIGNED NOT NULL,
  notes TEXT NULL,

  status ENUM('new', 'confirmed', 'refused', 'arrived', 'cancelled') NOT NULL DEFAULT 'new',
  refused_reason VARCHAR(255) NULL,
  source VARCHAR(32) NOT NULL DEFAULT 'n8n',
  confirmed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,

  -- MySQL has no partial unique index like PostgreSQL.
  -- We emulate active-only uniqueness with a generated nullable column.
  active_slot TINYINT GENERATED ALWAYS AS (
    CASE
      WHEN status IN ('cancelled', 'refused') THEN NULL
      ELSE 1
    END
  ) STORED,

  CONSTRAINT chk_reservation_time CHECK (reservation_time REGEXP '^[0-2][0-9]:[0-5][0-9]$'),
  CONSTRAINT chk_guests CHECK (guests BETWEEN 1 AND 20)
);

CREATE INDEX idx_reservations_date_time
  ON reservations(reservation_date, reservation_time);

CREATE INDEX idx_reservations_status
  ON reservations(status);

CREATE INDEX idx_reservations_phone
  ON reservations(client_phone);

-- Blocks duplicates while reservation is active (new/confirmed/arrived).
CREATE UNIQUE INDEX idx_reservations_unique_active
  ON reservations(client_phone, reservation_date, reservation_time, active_slot);
