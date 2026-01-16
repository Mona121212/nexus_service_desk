import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import {
  getAdminMenus,
  createAdminMenu,
  updateAdminMenu,
  deleteAdminMenu,
} from '../../api/admin';
import { AppMenuDto, CreateAppMenuDto, UpdateAppMenuDto } from '../../types/admin';
import { useAuth } from '../../hooks/useAuth';
import { Permissions } from '../../constants/permissions';
import './AdminMenus.css';

export const AdminMenus: React.FC = () => {
  const [menus, setMenus] = useState<AppMenuDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<AppMenuDto | null>(null);
  const [formData, setFormData] = useState<CreateAppMenuDto>({
    code: '',
    name: '',
    path: '',
    icon: '',
    parentId: undefined,
    sortOrder: 0,
    isEnabled: true,
  });
  const [processing, setProcessing] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Check permission
    if (!hasPermission(Permissions.Menus.Manage)) {
      setError('You do not have permission to access this page');
      return;
    }
    fetchMenus();
  }, [hasPermission]);

  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminMenus();
      setMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      code: '',
      name: '',
      path: '',
      icon: '',
      parentId: undefined,
      sortOrder: 0,
      isEnabled: true,
    });
    setSelectedMenu(null);
    setShowCreateModal(true);
  };

  const handleEditClick = (menu: AppMenuDto) => {
    setSelectedMenu(menu);
    setFormData({
      code: menu.code,
      name: menu.name,
      path: menu.path || '',
      icon: menu.icon || '',
      parentId: menu.parentId || undefined,
      sortOrder: menu.sortOrder,
      isEnabled: menu.isEnabled,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) {
      return;
    }

    try {
      await deleteAdminMenu(id);
      await fetchMenus();
      alert('Menu deleted successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete menu');
    }
  };

  const handleCreate = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Please fill in required fields (Code and Name)');
      return;
    }

    setProcessing(true);
    try {
      await createAdminMenu(formData);
      setShowCreateModal(false);
      setFormData({
        code: '',
        name: '',
        path: '',
        icon: '',
        parentId: undefined,
        sortOrder: 0,
        isEnabled: true,
      });
      await fetchMenus();
      alert('Menu created successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create menu');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMenu || !formData.name.trim()) {
      alert('Please fill in required fields');
      return;
    }

    setProcessing(true);
    try {
      const updateData: UpdateAppMenuDto = {
        name: formData.name,
        path: formData.path,
        icon: formData.icon,
        parentId: formData.parentId,
        sortOrder: formData.sortOrder,
        isEnabled: formData.isEnabled,
      };
      await updateAdminMenu(selectedMenu.id, updateData);
      setShowEditModal(false);
      setSelectedMenu(null);
      await fetchMenus();
      alert('Menu updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update menu');
    } finally {
      setProcessing(false);
    }
  };

  if (!hasPermission(Permissions.Menus.Manage)) {
    return (
      <Layout>
        <div className="admin-menus">
          <div className="error">You do not have permission to access this page</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-menus">
        <div className="admin-menus-header">
          <h1>菜单管理</h1>
          <button className="btn-primary" onClick={handleCreateClick}>
            +添加菜单
          </button>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <>
            {menus.length === 0 ? (
              <div className="empty-state">No menus found</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>菜单名</th>
                    <th>路径</th>
                    <th>排序</th>
                    <th>启用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id}>
                      <td title={menu.id}>{menu.id?.substring(0, 8)}...</td>
                      <td>{menu.name}</td>
                      <td>{menu.path || 'N/A'}</td>
                      <td>{menu.sortOrder}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            menu.isEnabled ? 'status-enabled' : 'status-disabled'
                          }`}
                        >
                          {menu.isEnabled ? '是' : '否'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-link"
                            onClick={() => handleEditClick(menu)}
                          >
                            编辑
                          </button>
                          <button
                            className="btn-link btn-danger"
                            onClick={() => handleDeleteClick(menu.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div
            className="modal-overlay"
            onClick={() => !processing && setShowCreateModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>添加菜单</h2>
              <div className="modal-form">
                <div className="modal-form-group">
                  <label htmlFor="create-code">
                    代码 <span className="required">*</span>:
                  </label>
                  <input
                    id="create-code"
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="请输入菜单代码"
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="create-name">
                    菜单名 <span className="required">*</span>:
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="请输入菜单名"
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="create-path">路径:</label>
                  <input
                    id="create-path"
                    type="text"
                    value={formData.path}
                    onChange={(e) =>
                      setFormData({ ...formData, path: e.target.value })
                    }
                    placeholder="请输入路径"
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="create-icon">图标:</label>
                  <input
                    id="create-icon"
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="请输入图标"
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="create-sort">排序:</label>
                  <input
                    id="create-sort"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="modal-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, isEnabled: e.target.checked })
                      }
                    />
                    启用
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleCreate}
                  disabled={processing}
                >
                  {processing ? '处理中...' : '创建'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={processing}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedMenu && (
          <div
            className="modal-overlay"
            onClick={() => !processing && setShowEditModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>编辑菜单</h2>
              <div className="modal-form">
                <div className="modal-form-group">
                  <label htmlFor="edit-name">
                    菜单名 <span className="required">*</span>:
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="请输入菜单名"
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="edit-path">路径:</label>
                  <input
                    id="edit-path"
                    type="text"
                    value={formData.path}
                    onChange={(e) =>
                      setFormData({ ...formData, path: e.target.value })
                    }
                    placeholder="请输入路径"
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="edit-icon">图标:</label>
                  <input
                    id="edit-icon"
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="请输入图标"
                  />
                </div>
                <div className="modal-form-group">
                  <label htmlFor="edit-sort">排序:</label>
                  <input
                    id="edit-sort"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="modal-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) =>
                        setFormData({ ...formData, isEnabled: e.target.checked })
                      }
                    />
                    启用
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleUpdate}
                  disabled={processing}
                >
                  {processing ? '处理中...' : '保存'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMenu(null);
                  }}
                  disabled={processing}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
