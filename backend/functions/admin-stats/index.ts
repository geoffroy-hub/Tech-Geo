// ===================================================
// Tech-geo — Admin Stats Edge Function
// ===================================================
// Retourne les statistiques du dashboard admin :
// ventes, revenus, produits populaires, commandes récentes
//
// Deploy: supabase functions deploy admin-stats
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { data: { user } } = await supabase.auth.getUser(authHeader);
  if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

  // Vérifier rôle admin
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin only' }, 403);

  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '30d';

  const stats = {
    overview: await getOverview(supabase, period),
    revenue: await getRevenue(supabase, period),
    orders: await getOrderStats(supabase, period),
    products: await getProductStats(supabase),
    customers: await getCustomerStats(supabase),
    messages: await getMessageStats(supabase),
  };

  return jsonResponse(stats);
});

async function getOverview(supabase, period) {
  const since = getDateSince(period);

  // Total commandes
  const { count: totalOrders } = await supabase
    .from('orders').select('*', { count: 'exact', head: true })
    .gte('created_at', since);

  // Commandes en attente
  const { count: pendingOrders } = await supabase
    .from('orders').select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Commandes en cours
  const { count: processingOrders } = await supabase
    .from('orders').select('*', { count: 'exact', head: true })
    .eq('status', 'processing');

  // Revenus (commandes payées)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .eq('payment_status', 'paid')
    .gte('created_at', since);

  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  // Nombre de clients
  const { count: totalCustomers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true })
    .eq('role', 'client');

  // Nombre de produits
  const { count: totalProducts } = await supabase
    .from('products').select('*', { count: 'exact', head: true })
    .eq('available', true);

  // Messages non lus
  const { count: unreadMessages } = await supabase
    .from('contact_messages').select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  return {
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    processingOrders: processingOrders || 0,
    totalRevenue,
    totalCustomers: totalCustomers || 0,
    totalProducts: totalProducts || 0,
    unreadMessages: unreadMessages || 0,
  };
}

async function getRevenue(supabase, period) {
  const since = getDateSince(period);

  const { data } = await supabase
    .from('orders')
    .select('total, created_at, payment_status')
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  if (!data || data.length === 0) return { daily: [], total: 0 };

  // Grouper par jour
  const dailyMap = new Map();
  let total = 0;

  for (const order of data) {
    if (order.payment_status === 'paid') {
      const day = order.created_at.split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + Number(order.total));
      total += Number(order.total);
    }
  }

  const daily = Array.from(dailyMap.entries()).map(([date, amount]) => ({
    date,
    amount,
  }));

  return { daily, total };
}

async function getOrderStats(supabase, period) {
  const since = getDateSince(period);

  const { data } = await supabase
    .from('orders')
    .select('status, payment_method, created_at')
    .gte('created_at', since);

  if (!data) return { byStatus: {}, byPayment: {}, recent: [] };

  const byStatus = {};
  const byPayment = {};

  for (const order of data) {
    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
    byPayment[order.payment_method || 'unknown'] = (byPayment[order.payment_method || 'unknown'] || 0) + 1;
  }

  // Dernières commandes
  const { data: recent } = await supabase
    .from('orders')
    .select('id, customer, total, status, payment_status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return { byStatus, byPayment, recent: recent || [] };
}

async function getProductStats(supabase) {
  // Top produits vendus
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .eq('payment_status', 'paid');

  const productSales = {};
  for (const order of (orders || [])) {
    for (const item of (order.items || [])) {
      productSales[item.id] = {
        name: item.name,
        qty: (productSales[item.id]?.qty || 0) + Number(item.qty),
        revenue: (productSales[item.id]?.revenue || 0) + Number(item.price * item.qty),
      };
    }
  }

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  // Produits avec stock faible
  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, stock, available')
    .lte('stock', 10)
    .eq('available', true)
    .order('stock', { ascending: true })
    .limit(10);

  return { topProducts, lowStock: lowStock || [] };
}

async function getCustomerStats(supabase) {
  // Nouveaux clients (30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: newCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('role', 'client');

  // Top clients par commandes
  const { data: topCustomers } = await supabase
    .from('orders')
    .select('user_id, customer')
    .eq('payment_status', 'paid');

  const customerOrders = {};
  for (const order of (topCustomers || [])) {
    const key = order.user_id || order.customer?.email || 'guest';
    customerOrders[key] = {
      name: order.customer?.name || 'Client',
      email: order.customer?.email || '',
      orders: (customerOrders[key]?.orders || 0) + 1,
    };
  }

  const topCustomersList = Object.values(customerOrders)
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  return { newCustomers: newCustomers || 0, topCustomers: topCustomersList };
}

async function getMessageStats(supabase) {
  const { data } = await supabase
    .from('contact_messages')
    .select('status, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (!data) return { total: 0, unread: 0, recent: [] };

  const unread = data.filter(m => !m.is_read).length;
  const recent = data.slice(0, 10).map(m => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    created_at: m.created_at,
    is_read: m.is_read,
  }));

  return { total: data.length, unread, recent };
}

function getDateSince(period) {
  const now = new Date();
  switch (period) {
    case '7d': now.setDate(now.getDate() - 7); break;
    case '30d': now.setDate(now.getDate() - 30); break;
    case '90d': now.setDate(now.getDate() - 90); break;
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case 'all': return '2020-01-01T00:00:00Z';
    default: now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
