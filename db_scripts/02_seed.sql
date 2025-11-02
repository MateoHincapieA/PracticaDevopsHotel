-- Ejecuta con: psql -d <tu_bd> -f 02_seed.sql

BEGIN;

-- Rooms
INSERT INTO rooms (number, type, price) VALUES
  ('101', 'Single', 150000),
  ('102', 'Double', 220000),
  ('201', 'Suite',  450000),
  ('202', 'Twin',   240000),
  ('301', 'Deluxe', 350000)
ON CONFLICT (number) DO NOTHING;

-- Reservations (usa fechas futuras/pasadas válidas; checkout > checkin)
INSERT INTO reservations (guest_name, status, room_id, check_in, check_out)
SELECT 'Juan Pérez',       'confirmed'::reservation_status, r1.id, now() + interval '1 day',  now() + interval '3 days' FROM rooms r1 WHERE r1.number='101'
UNION ALL
SELECT 'María Gómez',      'pending'::reservation_status,   r2.id, now() + interval '5 days', now() + interval '8 days' FROM rooms r2 WHERE r2.number='201'
UNION ALL
SELECT 'Carlos Rodríguez', 'cancelled'::reservation_status, r3.id, now() - interval '10 days', now() - interval '7 days'  FROM rooms r3 WHERE r3.number='202';

-- Reviews (rating 1..5, comentario opcional)
WITH rs AS (
  SELECT id FROM reservations ORDER BY id
)
INSERT INTO reviews (rating, comment, reservation_id) VALUES
  (5, 'Excelente experiencia. Habitación impecable.', (SELECT id FROM rs LIMIT 1)),
  (3, 'Todo bien, pero podría mejorar el desayuno.', (SELECT id FROM rs OFFSET 1 LIMIT 1))
ON CONFLICT DO NOTHING;

COMMIT;
