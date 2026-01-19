import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyMenus } from "../api/menus";
import { Menu } from "../types/menu";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // All users (including Admin) use my-menus API to get their role-based menus
      // The my-menus API returns menus based on user's role-menu associations
      const data = await getMyMenus();
      console.log('Sidebar: Menu data fetched:', data);
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
      console.log('Sidebar: Menu update event received, refreshing menus...');
      fetchMenus();
    };

    window.addEventListener('menusUpdated', handleMenuUpdate);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('menusUpdated', handleMenuUpdate);
    };
  }, [fetchMenus]);

  const renderMenuItems = (menuList: typeof menus) => {
    return menuList.map((menu) => (
      <li key={menu.id}>
        <Link to={menu.path || "#"} className="menu-item">
          {menu.icon && <span className="menu-icon">{menu.icon}</span>}
          <span className="menu-name">{menu.name}</span>
        </Link>
        {menu.children && menu.children.length > 0 && (
          <ul className="submenu">{renderMenuItems(menu.children)}</ul>
        )}
      </li>
    ));
  };

  // Temporary hardcoded menu items until backend menu data is available
  const tempMenuItems = [
    { id: '1', name: 'My Repairs', path: '/repairs' },
    { id: '2', name: 'Create Repair', path: '/repairs/create' },
  ];

  return (
    <aside className="sidebar">
      <nav>
        {loading && <div className="menu-loading">Loading...</div>}
        {error && <div className="menu-error">Error: {error}</div>}
        {!loading && !error && (
          <ul className="menu-list">
            {menus.length > 0 ? (
              renderMenuItems(menus)
            ) : (
              // Show temporary menu items if no backend menu data
              tempMenuItems.map((item) => (
                <li key={item.id}>
                  <Link to={item.path} className="menu-item">
                    <span className="menu-name">{item.name}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </nav>
    </aside>
  );
};
