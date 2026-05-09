-- ===================================================
-- Tech-geo — Sample Data
-- ===================================================
-- Run after schema.sql to populate with initial data.
-- ===================================================

-- Sample products
INSERT INTO products (name, description, price, original_price, category, image_url, stock, available, featured, rating, review_count) VALUES
  ('Arduino Uno R3', 'Microcontrôleur idéal pour débuter en électronique. Compatible avec des milliers de tutoriels.', 15000, 18000, 'microcontroleurs', 'https://picsum.photos/seed/arduino/400/400', 50, true, true, 4.5, 12),
  ('Raspberry Pi 4 Kit', 'Kit complet avec boîtier, alimentation, carte microSD 32Go et dissipateurs thermiques.', 65000, 75000, 'single-board', 'https://picsum.photos/seed/rpi/400/400', 30, true, true, 4.8, 24),
  ('Capteur DHT22', 'Capteur de température et humidité haute précision (-40°C à 80°C, ±0.5°C).', 3500, NULL, 'capteurs', 'https://picsum.photos/seed/dht22/400/400', 200, true, false, 4.2, 8),
  ('Module Relais 4ch', 'Module relais 4 canaux 5V pour contrôler des appareils haute puissance.', 4500, 5500, 'modules', 'https://picsum.photos/seed/relais/400/400', 150, true, false, 4.0, 5),
  ('Écran OLED 0.96"', 'Écran OLED I2C 128x64 pixels, parfait pour les projets embarqués.', 7500, NULL, 'ecrans', 'https://picsum.photos/seed/oled/400/400', 80, true, true, 4.6, 15),
  ('Kit Résistances 500pcs', 'Assortiment de 500 résistances (22 valeurs) avec boîtier de rangement.', 5000, NULL, 'composants', 'https://picsum.photos/seed/resistors/400/400', 300, true, false, 4.3, 6);

-- Sample tutorials
INSERT INTO tutorials (title, slug, description, content, category, thumbnail_url, duration_minutes, published, featured, view_count) VALUES
  ('Introduction à l''électronique', 'introduction-electronique', 'Les bases de l''électronique : tension, courant, résistance et les lois fondamentales.', 'Contenu complet du tutoriel sur les bases de l''électronique...', 'electronique', 'https://picsum.photos/seed/electro-tuto/800/400', 15, true, true, 342),
  ('Bien coder avec Arduino', 'bien-coder-arduino', 'Les meilleures pratiques pour programmer un Arduino proprement.', 'Contenu sur les bonnes pratiques Arduino...', 'arduino', 'https://picsum.photos/seed/arduino-tuto/800/400', 20, true, true, 521),
  ('Créer un PCB avec KiCad', 'kicad-pcb', 'Guide complet pour concevoir et fabriquer vos propres circuits imprimés.', 'Tutoriel KiCad étape par étape...', 'pcb', 'https://picsum.photos/seed/kicad/800/400', 30, true, true, 189);

-- Default site settings (update the id with the one created by schema.sql)
UPDATE site_settings SET
  site_title = 'Tech-geo',
  site_description = 'Votre boutique tech et tutoriels électronique, Arduino, PCB et plus.',
  hero_text = 'Explorez la technologie. Apprenez. Créez.',
  map_iframe_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31846!2d1.22!3d6.17!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1',
  currency = 'FCFA',
  contact_email = 'contact@tech-geo.com',
  updated_at = NOW();
