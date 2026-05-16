-- =====================================================================
-- TECH-GEO — Déclarer un compte Admin
-- =====================================================================
-- Exécuter APRÈS avoir créé votre compte sur le site.
-- Remplacez 'votre@email.com' par votre vrai email.
-- =====================================================================

-- 1. Promouvoir votre compte en admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'votre@email.com';

-- 2. Vérifier que ça a bien fonctionné
SELECT email, role FROM profiles ORDER BY role;

-- =====================================================================
-- Pour rétrograder un utilisateur (si nécessaire) :
--   UPDATE profiles SET role = 'client' WHERE email = 'quelquun@email.com';
--
-- Un seul compte doit avoir role = 'admin'.
-- =====================================================================
