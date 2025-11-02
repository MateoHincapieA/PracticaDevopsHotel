-- Limpieza completa del esquema
-- Ejecuta con: psql -d <tu_bd> -f 03_drop.sql

BEGIN;

DROP TRIGGER IF EXISTS trg_reviews_updated ON reviews;
DROP TRIGGER IF EXISTS trg_reservations_updated ON reservations;
DROP TRIGGER IF EXISTS trg_rooms_updated ON rooms;

DROP FUNCTION IF EXISTS touch_updated_at();

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- Elimina el tipo ENUM si no es usado por otras tablas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    DROP TYPE reservation_status;
  END IF;
END$$;

COMMIT;
