-- Add 6 users to the database
INSERT INTO "user" (email, name, "isAdmin")
VALUES 
  ('drakanksha@destinpq.com', 'Dr Akanksha', true),
  ('mohitagrwal@destinpq.com', 'Mohit Agarwal', true),
  ('pratik@destinpq.com', 'Pratik', true),
  ('tejaswi.rangineni@desinpq.com', 'Tejaswi Rangineni', true),
  ('shaurya.bansal@destnipq.com', 'Shaurya Bansal', true),
  ('admin@destinpq.com', 'Admin User', true)
ON CONFLICT (email) 
DO UPDATE SET name = EXCLUDED.name, "isAdmin" = EXCLUDED."isAdmin"; 