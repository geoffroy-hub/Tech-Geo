// ===================================================
// Tech-geo — Manage Product Edge Function
// ===================================================
// Admin: create, update, delete, bulk import products
//
// Deploy: supabase functions deploy manage-product
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { data: { user } } = await supabase.auth.getUser(authHeader);
  if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (!['admin', 'editor'].includes(profile?.role)) {
    return jsonResponse({ error: 'Staff only' }, 403);
  }

  const body = await req.json();
  const { action } = body;

  switch (req.method) {
    case 'POST':
      if (action === 'bulk') return handleBulkImport(supabase, body);
      return handleCreate(supabase, body);

    case 'PUT':
      return handleUpdate(supabase, body);

    case 'DELETE':
      return handleDelete(supabase, body);
  }

  return jsonResponse({ error: 'Unknown action' }, 400);
});

async function handleCreate(supabase, body) {
  const { name, description, price, original_price, category, image_url, images, specs, stock, available, featured } = body;

  if (!name || price === undefined) {
    return jsonResponse({ error: 'name et price sont requis' }, 400);
  }

  const product = {
    name,
    description: description || '',
    price: Number(price),
    original_price: original_price ? Number(original_price) : null,
    category: category || 'general',
    image_url: image_url || '',
    images: images || [],
    specs: specs || {},
    stock: stock !== undefined ? Number(stock) : 0,
    available: available !== undefined ? available : true,
    featured: featured || false,
    rating: 0,
    review_count: 0,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('products').insert(product).select().single();

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true, product: data }, 201);
}

async function handleUpdate(supabase, body) {
  const { id, ...updates } = body;
  if (!id) return jsonResponse({ error: 'id est requis' }, 400);

  // Remove fields that shouldn't be updated directly
  delete updates.created_at;
  delete updates.rating;
  delete updates.review_count;

  if (updates.price) updates.price = Number(updates.price);
  if (updates.original_price) updates.original_price = Number(updates.original_price);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('products').update(updates).eq('id', id).select().single();

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true, product: data });
}

async function handleDelete(supabase, body) {
  const { id } = body;
  if (!id) return jsonResponse({ error: 'id est requis' }, 400);

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return jsonResponse({ error: error.message }, 400);

  return jsonResponse({ success: true, deletedId: id });
}

async function handleBulkImport(supabase, body) {
  const { products } = body;
  if (!Array.isArray(products) || products.length === 0) {
    return jsonResponse({ error: 'products array is required' }, 400);
  }

  if (products.length > 100) {
    return jsonResponse({ error: 'Max 100 produits par import' }, 400);
  }

  const formatted = products.map(p => ({
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    original_price: p.original_price ? Number(p.original_price) : null,
    category: p.category || 'general',
    image_url: p.image_url || '',
    images: p.images || [],
    specs: p.specs || {},
    stock: p.stock !== undefined ? Number(p.stock) : 0,
    available: p.available !== undefined ? p.available : true,
    featured: p.featured || false,
    rating: 0,
    review_count: 0,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('products').insert(formatted).select();

  if (error) return jsonResponse({ error: error.message }, 400);
  return jsonResponse({ success: true, imported: data.length, products: data }, 201);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
