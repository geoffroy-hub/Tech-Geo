// ===================================================
// Tech-geo — Check Stock Edge Function
// ===================================================
// Vérifie la disponibilité des produits en temps réel
//
// Deploy: supabase functions deploy check-stock
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);

  // Single product check
  const productId = url.searchParams.get('productId');
  if (productId) {
    return await checkSingle(supabase, productId);
  }

  // Bulk check
  if (req.method === 'POST') {
    const body = await req.json();
    const { items } = body;
    if (Array.isArray(items)) {
      return await checkBulk(supabase, items);
    }
  }

  return jsonResponse({ error: 'productId (query) ou items (POST body) requis' }, 400);
});

async function checkSingle(supabase, productId) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, available, price')
    .eq('id', productId)
    .single();

  if (error || !data) return jsonResponse({ error: 'Produit introuvable' }, 404);

  return jsonResponse({
    productId: data.id,
    name: data.name,
    available: data.available && data.stock > 0,
    stock: data.stock,
    stockStatus: getStockStatus(data.stock),
    price: data.price,
  });
}

async function checkBulk(supabase, items) {
  const ids = items.map(i => i.id).filter(Boolean);
  if (ids.length === 0) return jsonResponse({ error: 'No items to check' }, 400);
  if (ids.length > 50) return jsonResponse({ error: 'Max 50 items' }, 400);

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, stock, available, price')
    .in('id', ids);

  if (error) return jsonResponse({ error: error.message }, 400);

  const productMap = new Map((products || []).map(p => [p.id, p]));
  const results = [];
  let allAvailable = true;
  let lowStockCount = 0;

  for (const item of items) {
    const product = productMap.get(item.id);
    const requestedQty = item.qty || 1;

    if (!product) {
      results.push({ id: item.id, available: false, reason: 'Produit introuvable' });
      allAvailable = false;
      continue;
    }

    const inStock = product.available && product.stock >= requestedQty;
    const lowStock = product.stock > 0 && product.stock <= 10;

    if (!inStock) allAvailable = false;
    if (lowStock) lowStockCount++;

    results.push({
      id: product.id,
      name: product.name,
      available: inStock,
      stock: product.stock,
      stockStatus: getStockStatus(product.stock),
      price: product.price,
      requestedQty,
      lowStock,
      reason: !inStock
        ? (product.stock === 0 ? 'Rupture de stock' : `Stock insuffisant (${product.stock} dispo)`)
        : null,
    });
  }

  return jsonResponse({
    allAvailable,
    lowStockCount,
    items: results,
  });
}

function getStockStatus(stock) {
  if (stock === 0) return 'out_of_stock';
  if (stock <= 5) return 'critical';
  if (stock <= 10) return 'low';
  if (stock <= 50) return 'medium';
  return 'in_stock';
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
