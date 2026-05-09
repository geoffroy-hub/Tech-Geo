-- ===================================================
-- Tech-geo — Supabase Storage Setup
-- ===================================================
-- Run this in Supabase SQL Editor to create the media
-- storage bucket with RLS policies.
-- ===================================================

-- ===================================================
-- 1. Create the media bucket
-- ===================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,  -- 50MB max file size
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ===================================================
-- 2. Enable RLS on storage.objects
-- ===================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===================================================
-- 3. RLS Policies — Media Bucket
-- ===================================================

-- Public can view media
CREATE POLICY "Public can view media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Admins/editors can upload media
CREATE POLICY "Staff can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins/editors can update media (replace files)
CREATE POLICY "Staff can update media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Admins can delete media
CREATE POLICY "Admins can delete media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ===================================================
-- 4. Helper function: get public URL
-- ===================================================

CREATE OR REPLACE FUNCTION get_media_url(path TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'https://' || (SELECT id FROM storage.buckets WHERE name = 'media') || '.supabase.co/storage/v1/object/public/media/' || path;
$$;

-- ===================================================
-- 5. Automatic image resizing via CDN (optional)
-- ===================================================
-- Supabase CDN supports on-the-fly image transformation:
--
-- Original:    https://<project>.supabase.co/storage/v1/object/public/media/image.jpg
-- Thumbnail:   https://<project>.supabase.co/storage/v1/render/image/public/media/image.jpg?width=150&height=150&resize=cover
-- Small:       https://<project>.supabase.co/storage/v1/render/image/public/media/image.jpg?width=400
-- Medium:      https://<project>.supabase.co/storage/v1/render/image/public/media/image.jpg?width=800
--
-- No need to upload multiple sizes — use the render endpoint.
