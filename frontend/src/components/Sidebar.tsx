import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyMenus } from "../api/menus";
import { Menu } from "../types/menu";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenus = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // 直接从后端获取用户的权限菜单
      // 后端会根据用户的角色过滤菜单
      const data = await getMyMenus();
      console.log("Sidebar: Menu data fetched:", data);
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch menus");
      console.error("Failed to fetch menus:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();

    // 监听菜单更新事件（当角色菜单配置被保存时触发）
    const handleMenuUpdate = () => {
      console.log("Sidebar: Menu update event received, refreshing menus...");
      fetchMenus();
    };

    window.addEventListener("menusUpdated", handleMenuUpdate);

    return () => {
      window.removeEventListener("menusUpdated", handleMenuUpdate);
    };
  }, [fetchMenus]);

  const renderMenuItems = (menuList: Menu[]): React.ReactNode => {
    return menuList.map((menu) => (
      <li key={menu.id}>
        <Link to={menu.path} className="menu-item">
          {menu.icon && <span className="menu-icon">{menu.icon}</span>}
          <span className="menu-name">{menu.name}</span>
        </Link>
        {menu.children && menu.children.length > 0 && (
          <ul className="submenu">{renderMenuItems(menu.children)}</ul>
        )}
      </li>
    ));
  };

  return (
    <aside className="sidebar">
      <nav>
        {loading && <div className="menu-loading">Loading menus...</div>}
        {error && <div className="menu-error">Error: {error}</div>}
        {!loading && !error && (
          <ul className="menu-list">
            {menus.length > 0 ? (
              renderMenuItems(menus)
            ) : (
              <li className="menu-empty">No menus available for your role</li>
            )}
          </ul>
        )}
      </nav>
    </aside>
  );
};
