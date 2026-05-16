// ===================================================
// Tech-geo — Search Edge Function
// ===================================================
// Recherche full-text sur produits et tutoriels
//
// Deploy: supabase functions deploy search
// Usage:  GET /search?q=arduino&category=capteurs&type=product
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const url = new URL(req.url);

  const query = url.searchParams.get('q')?.trim();
  const type = url.searchParams.get('type') || 'all';
  const category = url.searchParams.get('category');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  if (!query) {
    return jsonResponse({ error: 'Parameter q (query) is required' }, 400);
  }

  const results = {
    products: [],
    tutorials: [],
    total: 0,
    query,
  };

  if (type === 'all' || type === 'product') {
    results.products = await searchProducts(supabase, query, category, limit);
  }

  if (type === 'all' || type === 'tutorial') {
    results.tutorials = await searchTutorials(supabase, query, category, limit);
  }

  results.total = results.products.length + results.tutorials.length;

  return jsonResponse(results);
});

async function searchProducts(supabase, query, category, limit) {
  let q = supabase
    .from('products')
    .select('id, name, description, price, original_price, category, image_url, stock, available, rating, review_count, created_at')
    .eq('available', true)
    .order('rating', { ascending: false })
    .limit(limit);

  // Recherche par nom et description
  q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  if (category) {
    q = q.eq('category', category);
  }

  const { data, error } = await q;
  if (error) {
    console.error('[search] Product search error:', error.message);
    return [];
  }

  // Calculer un score de pertinence simple
  return (data || []).map(p => ({
    ...p,
    _score: calculateProductScore(p, query),
  })).sort((a, b) => b._score - a._score);
}

async function searchTutorials(supabase, query, category, limit) {
  let q = supabase
    .from('tutorials')
    .select('id, title, slug, description, category, thumbnail_url, duration_minutes, author_name, published, view_count, created_at')
    .eq('published', true)
    .order('view_count', { ascending: false })
    .limit(limit);

  q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (category) {
    q = q.eq('category', category);
  }

  const { data, error } = await q;
  if (error) {
    console.error('[search] Tutorial search error:', error.message);
    return [];
  }

  return (data || []).map(t => ({
    ...t,
    _score: calculateTutorialScore(t, query),
  })).sort((a, b) => b._score - a._score);
}

function calculateProductScore(product, query) {
  let score = 0;
  const q = query.toLowerCase();
  const name = product.name?.toLowerCase() || '';
  const desc = product.description?.toLowerCase() || '';

  // Match exact dans le nom = +10
  if (name.includes(q)) score += 10;
  // Match dans la description = +3
  if (desc.includes(q)) score += 3;
  // Bonus pour rating
  score += (product.rating || 0) * 0.5;
  // Bonus pour stock disponible
  if (product.stock > 0) score += 1;

  return score;
}

function calculateTutorialScore(tutorial, query) {
  let score = 0;
  const q = query.toLowerCase();
  const title = tutorial.title?.toLowerCase() || '';
  const desc = tutorial.description?.toLowerCase() || '';

  if (title.includes(q)) score += 10;
  if (desc.includes(q)) score += 3;
  // Bonus pour popularité
  score += (tutorial.view_count || 0) * 0.01;

  return score;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
