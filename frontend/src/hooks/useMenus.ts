import { useState, useEffect, useCallback } from 'react';
import { getMyMenus as getMyMenusApi } from '../api/menus';
import { Menu } from '../types/menu';

export const useMenus = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyMenusApi();
      setMenus(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to fetch menus');
    }
  }, []);

  useEffect(() => {
    fetchMenus();

    // Listen for menu update events (triggered when role menu configuration is saved)
    const handleMenuUpdate = () => {
      fetchMenus();
    };

    window.addEventListener('menusUpdated', handleMenuUpdate);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('menusUpdated', handleMenuUpdate);
    };
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    fetchMenus,
  };
};
