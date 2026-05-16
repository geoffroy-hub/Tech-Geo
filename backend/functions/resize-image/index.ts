// ===================================================
// Tech-geo — Resize Image Edge Function
// ===================================================
// Resizes uploaded images for web optimization
//
// Deploy: supabase functions deploy resize-image
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Image } from 'https://deno.land/x/imagescript@1.2.17/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const bucket = Deno.env.get('STORAGE_BUCKET') || 'media';

const SIZES = {
  thumb: { w: 150, h: 150 },
  small: { w: 400, h: 400 },
  medium: { w: 800, h: 800 },
  large: { w: 1200, h: 1200 },
};

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { data: { user } } = await supabase.auth.getUser(auth);
  if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

  const body = await req.json();
  const { imageUrl, size, customWidth, customHeight } = body;
  if (!imageUrl) return jsonResponse({ error: 'imageUrl is required' }, 400);

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return jsonResponse({ error: 'Failed to download image' }, 400);

  const buffer = await imgRes.arrayBuffer();
  const image = await Image.decode(new Uint8Array(buffer));

  let w, h;
  if (customWidth && customHeight) {
    w = customWidth; h = customHeight;
  } else if (size && SIZES[size]) {
    w = SIZES[size].w; h = SIZES[size].h;
  } else {
    w = SIZES.medium.w; h = SIZES.medium.h;
  }

  const resized = image.resize(w, h, Image.RESIZE_AUTO);
  const resizedBuffer = await resized.encodeJPEG(85);

  const originalName = imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg';
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const path = `resized/${baseName}-${w}x${h}.jpg`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, resizedBuffer, { contentType: 'image/jpeg', upsert: true });

  if (error) return jsonResponse({ error: 'Upload failed', details: error.message }, 500);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  return jsonResponse({ success: true, url: urlData.publicUrl, path, width: w, height: h });
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
