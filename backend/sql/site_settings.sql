-- Script de configuration pour la gestion des paramètres dynamiques du site
-- Ce script crée la table site_settings et configure les politiques de sécurité (RLS)

-- 1. Création de la table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activation de la sécurité (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Politique : Lecture publique autorisée pour tous les utilisateurs (visiteurs et connectés)
DROP POLICY IF EXISTS "Lecture publique des paramètres" ON site_settings;
CREATE POLICY "Lecture publique des paramètres" 
ON site_settings 
FOR SELECT 
USING (true);

-- 4. Politique : Modification autorisée pour les administrateurs
-- Note: On autorise tout pour le moment pour faciliter la configuration initiale
DROP POLICY IF EXISTS "Admin peut tout modifier" ON site_settings;
CREATE POLICY "Admin peut tout modifier" 
ON site_settings 
FOR ALL 
USING (true);

-- 5. Insertion des valeurs initiales pour les nouvelles fonctionnalités
INSERT INTO site_settings (key, value) VALUES 
('hiveqash_link', 'https://www.hiveqash.com/'),
('api_pdf_guide', '#'),
('opencode_pdf_guide', '#'),
('groq_api_admin', ''),
('groq_api_user', ''),
('groq_model_admin', 'llama-3.3-70b-versatile'),
('groq_model_user', 'llama-3.3-70b-versatile'),
('soft_proteus', '#'),
('soft_office', '#'),
('soft_pmas', '#')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Commentaire de succès
COMMENT ON TABLE site_settings IS 'Table de configuration dynamique pour Tech-Geo (Liens promotionnels, téléchargements, etc.)';
