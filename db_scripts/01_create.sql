-- Schema: rooms, reservations, reviews
-- Ejecuta con: psql -d <tu_bd> -f 01_create.sql

BEGIN;

-- Tipo ENUM para estado de reserva
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('pending','confirmed','cancelled');
  END IF;
END$$;

-- Tabla de habitaciones
CREATE TABLE IF NOT EXISTS rooms (
  id           BIGSERIAL PRIMARY KEY,
  number       TEXT NOT NULL UNIQUE,                     -- validator: unique
  type         TEXT NOT NULL,                            -- validator: notEmpty
  price        NUMERIC(12,2) NOT NULL CHECK (price >= 0),-- validator: min 0
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservations (
  id           BIGSERIAL PRIMARY KEY,
  guest_name   TEXT NOT NULL,                             -- validator: notEmpty
  status       reservation_status NOT NULL DEFAULT 'pending',
  room_id      BIGINT NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in     TIMESTAMPTZ NOT NULL,                      -- validator: isISO8601
  check_out    TIMESTAMPTZ NOT NULL,                      -- validator: isISO8601 + > check_in
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_out_after_check_in CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_reservations_room_id ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_checkin  ON reservations(check_in);
CREATE INDEX IF NOT EXISTS idx_reservations_checkout ON reservations(check_out);

-- Tabla de reviews
CREATE TABLE IF NOT EXISTS reviews (
  id              BIGSERIAL PRIMARY KEY,
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5), -- validator: 1..5
  comment         TEXT,                                        -- validator: string opcional
  reservation_id  BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_reservation_id ON reviews(reservation_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rooms_updated ON rooms;
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON rooms
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_reservations_updated ON reservations;
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated ON reviews;
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

COMMIT;
