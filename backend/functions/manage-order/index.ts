// ===================================================
// Tech-geo — Manage Order Edge Function
// ===================================================
// Admin: update status, cancel, refund, add notes
//
// Deploy: supabase functions deploy manage-order
// ===================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { data: { user } } = await supabase.auth.getUser(authHeader);
  if (!user) return jsonResponse({ error: 'Invalid token' }, 401);

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') return jsonResponse({ error: 'Admin only' }, 403);

  const body = await req.json();
  const { orderId, action, status, notes } = body;

  if (!orderId || !action) {
    return jsonResponse({ error: 'orderId et action sont requis' }, 400);
  }

  const { data: order, error: orderError } = await supabase
    .from('orders').select('*').eq('id', orderId).single();

  if (orderError || !order) return jsonResponse({ error: 'Commande introuvable' }, 404);

  let result;
  switch (action) {
    case 'update_status':
      result = await updateStatus(supabase, order, status, notes);
      break;
    case 'cancel':
      result = await cancelOrder(supabase, order, notes);
      break;
    case 'refund':
      result = await refundOrder(supabase, order, notes);
      break;
    case 'add_notes':
      result = await addNotes(supabase, order, notes);
      break;
    case 'mark_shipped':
      result = await markShipped(supabase, order, notes);
      break;
    case 'mark_delivered':
      result = await markDelivered(supabase, order);
      break;
    default:
      return jsonResponse({ error: `Action invalide : ${action}` }, 400);
  }

  if (!result.success) {
    return jsonResponse({ error: result.error }, 400);
  }

  return jsonResponse({ success: true, order: result.order });
});

async function updateStatus(supabase, order, newStatus, notes) {
  if (!VALID_STATUSES.includes(newStatus)) {
    return { success: false, error: `Statut invalide. Options : ${VALID_STATUSES.join(', ')}` };
  }

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Transition non autorisée : ${order.status} → ${newStatus}` };
  }

  const updates = { status: newStatus, updated_at: new Date().toISOString() };
  if (notes) updates.notes = (order.notes || '') + `\n[${new Date().toISOString()}] ${notes}`;

  if (newStatus === 'cancelled') {
    updates.payment_status = order.payment_status === 'paid' ? 'refunded' : 'unpaid';
  }

  if (newStatus === 'delivered' && order.payment_status === 'unpaid') {
    // Cash on delivery — mark as paid on delivery
    updates.payment_status = 'paid';
    updates.payment_method = 'cash';
  }

  const { data, error } = await supabase
    .from('orders').update(updates).eq('id', order.id).select().single();

  if (error) return { success: false, error: error.message };

  // Notify customer if status changed
  if (order.customer?.email && newStatus !== 'pending') {
    await notifyStatusChange(order.id, newStatus);
  }

  return { success: true, order: data };
}

async function cancelOrder(supabase, order, notes) {
  if (order.status === 'delivered') {
    return { success: false, error: 'Impossible d\'annuler une commande livrée' };
  }

  if (order.status === 'cancelled') {
    return { success: false, error: 'Commande déjà annulée' };
  }

  const updates = {
    status: 'cancelled',
    payment_status: order.payment_status === 'paid' ? 'refunded' : 'unpaid',
    updated_at: new Date().toISOString(),
    notes: (order.notes || '') + `\n[${new Date().toISOString()}] Annulé : ${notes || ''}`,
  };

  const { data, error } = await supabase
    .from('orders').update(updates).eq('id', order.id).select().single();

  if (error) return { success: false, error: error.message };

  // Restore stock if order was processing
  if (order.status === 'processing') {
    await restoreStock(supabase, order);
  }

  if (order.customer?.email) {
    await notifyStatusChange(order.id, 'cancelled');
  }

  return { success: true, order: data };
}

async function refundOrder(supabase, order, notes) {
  if (order.payment_status !== 'paid') {
    return { success: false, error: 'Seules les commandes payées peuvent être remboursées' };
  }

  const updates = {
    payment_status: 'refunded',
    status: 'cancelled',
    updated_at: new Date().toISOString(),
    notes: (order.notes || '') + `\n[${new Date().toISOString()}] Remboursé : ${notes || ''}`,
  };

  const { data, error } = await supabase
    .from('orders').update(updates).eq('id', order.id).select().single();

  if (error) return { success: false, error: error.message };

  await restoreStock(supabase, order);

  if (order.customer?.email) {
    await notifyStatusChange(order.id, 'cancelled');
  }

  return { success: true, order: data };
}

async function addNotes(supabase, order, notes) {
  if (!notes) return { success: false, error: 'Notes requises' };

  const { data, error } = await supabase
    .from('orders')
    .update({
      notes: (order.notes || '') + `\n[${new Date().toISOString()}] ${notes}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, order: data };
}

async function markShipped(supabase, order, notes) {
  return updateStatus(supabase, order, 'shipped', notes);
}

async function markDelivered(supabase, order) {
  return updateStatus(supabase, order, 'delivered', 'Livré');
}

async function restoreStock(supabase, order) {
  for (const item of (order.items || [])) {
    await supabase
      .from('products')
      .update({ stock: supabase.from('products').select('stock').eq('id', item.id)[0] + Number(item.qty) })
      .eq('id', item.id);
  }
}

async function notifyStatusChange(orderId, newStatus) {
  const notifyUrl = Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'functions.supabase.co') + '/notify-order';
  if (!notifyUrl) return;

  try {
    await fetch(notifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, type: 'status_update' }),
    });
  } catch { /* ignore notification errors */ }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
