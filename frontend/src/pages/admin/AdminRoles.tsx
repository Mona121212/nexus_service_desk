import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import {
  getRolesList,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  updatePermissions,
} from '../../api/admin';
import {
  IdentityRoleDto,
  IdentityRoleCreateDto,
  IdentityRoleUpdateDto,
  PermissionGroupDto,
  PermissionGrantInfoDto,
  UpdatePermissionDto,
  GetIdentityRolesInput,
} from '../../types/admin';
import { useAuth } from '../../hooks/useAuth';
import './AdminRoles.css';

export const AdminRoles: React.FC = () => {
  const [roles, setRoles] = useState<IdentityRoleDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<IdentityRoleDto | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroupDto[]>([]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [permissionFilter, setPermissionFilter] = useState('');
  const [pagination, setPagination] = useState({
    skipCount: 0,
    maxResultCount: 10,
    currentPage: 1,
  });

  const [formData, setFormData] = useState<IdentityRoleCreateDto>({
    name: '',
    isDefault: false,
    isPublic: false,
  });

  useEffect(() => {
    fetchRoles();
  }, [pagination.currentPage]);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole.name);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const input: GetIdentityRolesInput = {
        skipCount: (pagination.currentPage - 1) * pagination.maxResultCount,
        maxResultCount: pagination.maxResultCount,
      };
      const result = await getRolesList(input);
      setRoles(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPermissions('R', roleName); // R = Role
      setPermissionGroups(result.groups || []);
      
      // Build permissions map
      const permMap: Record<string, boolean> = {};
      result.groups?.forEach(group => {
        group.permissions?.forEach(perm => {
          permMap[perm.name] = perm.isGranted;
        });
      });
      setPermissions(permMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Please enter role name');
      return;
    }

    try {
      await createRole(formData);
      setShowCreateModal(false);
      resetForm();
      await fetchRoles();
      alert('Role created successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create role');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRole || !formData.name.trim()) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const updateData: IdentityRoleUpdateDto = {
        name: formData.name,
        isDefault: formData.isDefault,
        isPublic: formData.isPublic,
      };
      await updateRole(selectedRole.id, updateData);
      setShowEditModal(false);
      resetForm();
      await fetchRoles();
      alert('Role updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRole(id);
      await fetchRoles();
      alert('Role deleted successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete role');
    }
  };

  const handleOpenPermissionModal = (role: IdentityRoleDto) => {
    setSelectedRole(role);
    setShowPermissionModal(true);
  };

  const handlePermissionChange = (permissionName: string, isGranted: boolean) => {
    setPermissions({
      ...permissions,
      [permissionName]: isGranted,
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      // Build permissions list from all permission groups to ensure we include all permissions
      // This ensures that even if a permission is not in the initial permissions state,
      // it will be included in the update if it exists in permissionGroups
      const allPermissions: Record<string, boolean> = {};
      
      // First, add all permissions from permissionGroups with their current granted status
      permissionGroups.forEach(group => {
        group.permissions?.forEach(perm => {
          // Use the value from permissions state if it exists (user may have changed it),
          // otherwise use the original isGranted value from the API response
          allPermissions[perm.name] = permissions[perm.name] !== undefined 
            ? permissions[perm.name] 
            : perm.isGranted;
        });
      });
      
      // Also include any permissions that were manually added to the permissions state
      // (in case user selected a permission that's not in permissionGroups)
      Object.keys(permissions).forEach(name => {
        if (!allPermissions.hasOwnProperty(name)) {
          allPermissions[name] = permissions[name];
        }
      });
      
      const permissionsToUpdate: UpdatePermissionDto[] = Object.keys(allPermissions).map(name => ({
        name,
        isGranted: allPermissions[name],
      }));

      await updatePermissions('R', selectedRole.name, {
        permissions: permissionsToUpdate,
      });
      
      alert('Permissions updated successfully');
      setShowPermissionModal(false);
      setSelectedRole(null);
      setPermissionFilter('');
      await fetchRolePermissions(selectedRole.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update permissions');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      isDefault: false,
      isPublic: false,
    });
    setSelectedRole(null);
  };

  const handleEdit = (role: IdentityRoleDto) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      isDefault: role.isDefault,
      isPublic: role.isPublic,
    });
    setShowEditModal(true);
  };

  const filteredPermissionGroups = permissionGroups.map(group => ({
    ...group,
    permissions: group.permissions?.filter(perm => 
      perm.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
      perm.displayName?.toLowerCase().includes(permissionFilter.toLowerCase())
    ) || [],
  })).filter(group => group.permissions && group.permissions.length > 0);

  const renderPermissionTree = (group: PermissionGroupDto) => {
    return (
      <div key={group.name} className="permission-group">
        <h4>{group.displayName || group.name}</h4>
        <div className="permission-list">
          {group.permissions?.map((perm) => (
            <label key={perm.name} className="permission-item">
              <input
                type="checkbox"
                checked={permissions[perm.name] || false}
                onChange={(e) => handlePermissionChange(perm.name, e.target.checked)}
              />
              <span>{perm.displayName || perm.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="admin-roles">
        <div className="admin-roles-header">
          <h1>Role Management</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            Create Role
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Is Default</th>
                  <th>Is Public</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.isDefault ? 'Yes' : 'No'}</td>
                    <td>{role.isPublic ? 'Yes' : 'No'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(role)}>Edit</button>
                      <button className="btn btn-sm btn-info" onClick={() => handleOpenPermissionModal(role)}>
                        Manage Permissions
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(role.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {Math.ceil(totalCount / pagination.maxResultCount) || 1}
              </span>
              <button
                disabled={pagination.currentPage >= Math.ceil(totalCount / pagination.maxResultCount)}
                onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create Role</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                <div className="form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    />
                    Is Default
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    />
                    Is Public
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">Create</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedRole && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit Role</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <div className="form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    />
                    Is Default
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    />
                    Is Public
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">Update</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Permission Management Modal */}
        {showPermissionModal && selectedRole && (
          <div className="modal-overlay" onClick={() => setShowPermissionModal(false)}>
            <div className="modal-content permission-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Permissions - {selectedRole.name}</h2>
              <div className="permission-filter">
                <input
                  type="text"
                  placeholder="Filter permissions..."
                  value={permissionFilter}
                  onChange={(e) => setPermissionFilter(e.target.value)}
                />
              </div>
              {loading ? (
                <div>Loading permissions...</div>
              ) : (
                <div className="permissions-container">
                  {filteredPermissionGroups.map((group) => renderPermissionTree(group))}
                </div>
              )}
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleSavePermissions}>Save</button>
                <button className="btn btn-secondary" onClick={() => setShowPermissionModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
