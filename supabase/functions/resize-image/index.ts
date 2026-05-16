// ===================================================
// Tech-geo — Resize Image Edge Function
// ===================================================
// Automatically resizes uploaded images to optimize
// for web delivery. Supports multiple output sizes.
//
// Usage:
//   curl -X POST http://localhost:54321/functions/v1/resize-image \
//     -H "Authorization: Bearer <anon-key>" \
//     -H "Content-Type: application/json" \
//     -d '{"imageUrl": "...", "width": 400, "height": 400}'
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from 'https://deno.land/x/imagescript@1.2.17/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const storageBucket = Deno.env.get('STORAGE_BUCKET') || 'media';

const SIZES = {
  thumb: { width: 150, height: 150 },
  small: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1200, height: 1200 },
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify auth
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { imageUrl, size, customWidth, customHeight } = body;

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'imageUrl is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Download original image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to download image' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const buffer = await imageResponse.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  // Decode image
  const image = await Image.decode(uint8Array);

  // Determine target dimensions
  let targetWidth: number;
  let targetHeight: number;

  if (customWidth && customHeight) {
    targetWidth = customWidth;
    targetHeight = customHeight;
  } else if (size && SIZES[size]) {
    targetWidth = SIZES[size].width;
    targetHeight = SIZES[size].height;
  } else {
    // Default to medium
    targetWidth = SIZES.medium.width;
    targetHeight = SIZES.medium.height;
  }

  // Resize maintaining aspect ratio
  const resized = image.resize(
    targetWidth,
    targetHeight,
    Image.RESIZE_AUTO
  );

  // Encode as JPEG (85% quality)
  const resizedBuffer = await resized.encodeJPEG(85);

  // Generate filename
  const originalName = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const resizedPath = `resized/${baseName}-${targetWidth}x${targetHeight}.jpg`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(storageBucket)
    .upload(resizedPath, resizedBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to upload resized image', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(storageBucket)
    .getPublicUrl(resizedPath);

  return new Response(
    JSON.stringify({
      success: true,
      url: urlData.publicUrl,
      path: resizedPath,
      width: targetWidth,
      height: targetHeight,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
});
