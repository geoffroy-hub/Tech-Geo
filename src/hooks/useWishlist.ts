'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserWishlist();
    } else {
      const local = JSON.parse(localStorage.getItem('techgeo_wishlist') || '[]');
      setItems(local);
    }
  }, [user]);

  const loadUserWishlist = async () => {
    const { data } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const addItem = useCallback(async (itemId: string, itemType = 'product') => {
    if (!user) {
      const local = JSON.parse(localStorage.getItem('techgeo_wishlist') || '[]');
      if (!local.find((i: any) => i.id === itemId)) {
        local.push({ id: itemId, type: itemType });
        localStorage.setItem('techgeo_wishlist', JSON.stringify(local));
        setItems(local);
      }
      return;
    }
    await supabase.from('wishlist').insert({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType,
    });
    loadUserWishlist();
  }, [user]);

  const removeItem = useCallback(async (itemId: string, itemType = 'product') => {
    if (!user) {
      const local = JSON.parse(localStorage.getItem('techgeo_wishlist') || '[]');
      const filtered = local.filter((i: any) => !(i.id === itemId && i.type === itemType));
      localStorage.setItem('techgeo_wishlist', JSON.stringify(filtered));
      setItems(filtered);
      return;
    }
    await supabase.from('wishlist').delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId)
      .eq('item_type', itemType);
    loadUserWishlist();
  }, [user]);

  return { items, addItem, removeItem };
}
