-- Migration 011 : Ajouter client_email à la table orders
-- Permet à n8n d'envoyer le reçu PDF directement au client par email.
-- À exécuter dans Supabase > SQL Editor.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS client_email TEXT;
