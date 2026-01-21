import React, { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import {
  getAllRoles,
  getAdminMenus,
  getRoleMenus,
  saveRoleMenus,
} from "../../api/admin";
import { Role, AppMenuDto, SetRoleMenusDto } from "../../types/admin";
import { useAuth } from "../../hooks/useAuth";
import { Permissions } from "../../constants/permissions";
import "./AdminRoleMenus.css";
import { data } from "react-router-dom";

interface MenuTreeNode extends AppMenuDto {
  checked?: boolean;
  indeterminate?: boolean;
  children?: MenuTreeNode[];
}

export const AdminRoleMenus: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [allMenus, setAllMenus] = useState<AppMenuDto[]>([]);
  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Check permission
    if (!hasPermission(Permissions.RoleMenus.Manage)) {
      setError("You do not have permission to access this page");
      return;
    }
    fetchRoles();
    fetchAllMenus();
  }, [hasPermission]);

  useEffect(() => {
    if (selectedRoleId && allMenus.length > 0) {
      fetchRoleMenus(selectedRoleId);
    } else if (allMenus.length > 0) {
      // Reset menu tree when no role is selected
      buildMenuTree(allMenus, []);
    }
  }, [selectedRoleId, allMenus]);

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      // Ensure data is an array before filtering
      /*if (!Array.isArray(data)) {
        console.error('getAllRoles returned non-array data:', data);
        setError('Invalid response format: expected array');
        setRoles([]);
        return;
      }
      // Filter to show only Teacher, Electrician, Admin roles
      const filteredRoles = data.filter(
        (role) =>
          role.name === 'Teacher' ||
          role.name === 'Electrician' ||
          role.name === 'Admin'
      );*/
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch roles");
    }
  };

  const fetchAllMenus = async () => {
    try {
      const data = await getAdminMenus();
      setAllMenus(data);
      if (!selectedRoleId) {
        buildMenuTree(data, []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch menus");
    }
  };

  const fetchRoleMenus = async (roleId: string) => {
    setLoading(true);
    try {
      const roleMenuData = await getRoleMenus(roleId);
      const roleMenuIds = roleMenuData.map((menu) => menu.id);
      buildMenuTree(allMenus, roleMenuIds);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch role menus",
      );
    } finally {
      setLoading(false);
    }
  };

  const buildMenuTree = (menus: AppMenuDto[], checkedMenuIds: string[]) => {
    // Build tree structure
    const menuMap = new Map<string, MenuTreeNode>();
    const rootMenus: MenuTreeNode[] = [];

    // First pass: create all nodes
    menus.forEach((menu) => {
      const node: MenuTreeNode = {
        ...menu,
        checked: checkedMenuIds.includes(menu.id),
        indeterminate: false,
        children: [],
      };
      menuMap.set(menu.id, node);
    });

    // Second pass: build tree structure
    menus.forEach((menu) => {
      const node = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        rootMenus.push(node);
      }
    });

    // Sort by sortOrder
    const sortMenus = (menuList: MenuTreeNode[]) => {
      menuList.sort((a, b) => a.sortOrder - b.sortOrder);
      menuList.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };

    sortMenus(rootMenus);
    updateIndeterminateStates(rootMenus);
    setMenuTree(rootMenus);
  };

  const updateIndeterminateStates = (nodes: MenuTreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        updateIndeterminateStates(node.children);
        const checkedCount = node.children.filter(
          (child) => child.checked,
        ).length;
        const indeterminateCount = node.children.filter(
          (child) => child.indeterminate,
        ).length;

        if (checkedCount === node.children.length) {
          node.checked = true;
          node.indeterminate = false;
        } else if (checkedCount > 0 || indeterminateCount > 0) {
          node.checked = false;
          node.indeterminate = true;
        } else {
          node.checked = false;
          node.indeterminate = false;
        }
      }
    });
  };

  const handleCheckboxChange = (menuId: string, checked: boolean) => {
    const updateNode = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === menuId) {
          const newChecked = checked;
          // Update children
          const updateChildren = (children: MenuTreeNode[]): MenuTreeNode[] => {
            return children.map((child) => ({
              ...child,
              checked: newChecked,
              children: child.children
                ? updateChildren(child.children)
                : undefined,
            }));
          };

          return {
            ...node,
            checked: newChecked,
            indeterminate: false,
            children: node.children ? updateChildren(node.children) : undefined,
          };
        } else if (node.children) {
          return {
            ...node,
            children: updateNode(node.children),
          };
        }
        return node;
      });
    };

    const updatedTree = updateNode(menuTree);
    updateIndeterminateStates(updatedTree);
    setMenuTree(updatedTree);
  };

  const getCheckedMenuIds = (nodes: MenuTreeNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (menuNodes: MenuTreeNode[]) => {
      menuNodes.forEach((node) => {
        if (node.checked) {
          ids.push(node.id);
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return ids;
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      alert("Please select a role first");
      return;
    }

    setSaving(true);
    try {
      const checkedMenuIds = getCheckedMenuIds(menuTree);
      const input: SetRoleMenusDto = {
        roleId: selectedRoleId,
        menuIds: checkedMenuIds,
      };
      await saveRoleMenus(input);
      alert("Role menu configuration saved successfully");

      // Trigger menu refresh event to update Sidebar
      console.log("AdminRoleMenus: Dispatching menusUpdated event...");
      window.dispatchEvent(new CustomEvent("menusUpdated"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save role menus");
    } finally {
      setSaving(false);
    }
  };

  const renderMenuTree = (nodes: MenuTreeNode[], level: number = 0) => {
    return (
      <ul className={`menu-tree ${level === 0 ? "menu-tree-root" : ""}`}>
        {nodes.map((node) => (
          <li key={node.id} className="menu-tree-item">
            <label
              className="menu-tree-label"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              <input
                type="checkbox"
                checked={node.checked || false}
                onChange={(e) =>
                  handleCheckboxChange(node.id, e.target.checked)
                }
              />
              <span className={node.indeterminate ? "indeterminate" : ""}>
                {node.name}
              </span>
              {node.path && <span className="menu-path">({node.path})</span>}
            </label>
            {node.children && node.children.length > 0 && (
              <>{renderMenuTree(node.children, level + 1)}</>
            )}
          </li>
        ))}
      </ul>
    );
  };

  if (!hasPermission(Permissions.RoleMenus.Manage)) {
    return (
      <Layout>
        <div className="admin-role-menus">
          <div className="error">
            You do not have permission to access this page
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-role-menus">
        <div className="admin-role-menus-header">
          <h1>Role Menu Configuration</h1>
        </div>

        {error && <div className="error">Error: {error}</div>}

        <div className="admin-role-menus-content">
          <div className="role-list-panel">
            <h2>Role List</h2>
            <ul className="role-list">
              {roles.map((role) => (
                <li
                  key={role.id}
                  className={`role-item ${
                    selectedRoleId === role.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  {role.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="menu-tree-panel">
            <h2>Menu Tree</h2>
            {!selectedRoleId ? (
              <div className="empty-state">Please select a role</div>
            ) : loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="menu-tree-container">
                {menuTree.length === 0 ? (
                  <div className="empty-state">No menus available</div>
                ) : (
                  renderMenuTree(menuTree)
                )}
              </div>
            )}
          </div>
        </div>

        <div className="admin-role-menus-footer">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!selectedRoleId || saving}
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </Layout>
  );
};
