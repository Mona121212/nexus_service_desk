import React from "react";
import { Link } from "react-router-dom";
import { useMenus } from "../hooks/useMenus";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  const { menus, loading, error } = useMenus();

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
