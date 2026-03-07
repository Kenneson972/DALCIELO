-- Reservations table for Pizza dal Cielo (Supabase / PostgreSQL)

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  client_name VARCHAR(120) NOT NULL,
  client_phone VARCHAR(24) NOT NULL,

  reservation_date DATE NOT NULL,
  reservation_time VARCHAR(5) NOT NULL CHECK (reservation_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  guests SMALLINT NOT NULL CHECK (guests BETWEEN 1 AND 20),
  notes TEXT,

  status VARCHAR(20) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'confirmed', 'refused', 'arrived', 'cancelled')),
  refused_reason VARCHAR(255),
  source VARCHAR(32) NOT NULL DEFAULT 'n8n',
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_phone ON reservations(client_phone);

-- Unicité : pas de doublon actif (même téléphone, date, heure)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_unique_active
  ON reservations(client_phone, reservation_date, reservation_time)
  WHERE status IN ('new', 'confirmed', 'arrived');
