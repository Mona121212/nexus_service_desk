import React, { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  updateUserRoles,
  getAssignableRoles,
} from "../../api/admin";
import {
  IdentityUserDto,
  IdentityUserCreateDto,
  IdentityUserUpdateDto,
  IdentityRoleDto,
  GetIdentityUsersInput,
} from "../../types/admin";
import { useAuth } from "../../hooks/useAuth";
import "./AdminUsers.css";

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<IdentityUserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IdentityUserDto | null>(
    null
  );
  const [assignableRoles, setAssignableRoles] = useState<IdentityRoleDto[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    skipCount: 0,
    maxResultCount: 10,
    currentPage: 1,
  });

  const [formData, setFormData] = useState<IdentityUserCreateDto>({
    userName: "",
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    password: "",
    isActive: true,
    lockoutEnabled: false,
    roleNames: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchAssignableRoles();
  }, [pagination.currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const input: GetIdentityUsersInput = {
        skipCount: (pagination.currentPage - 1) * pagination.maxResultCount,
        maxResultCount: pagination.maxResultCount,
      };
      const result = await getUsers(input);
      setUsers(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignableRoles = async () => {
    try {
      const roles = await getAssignableRoles();
      setAssignableRoles(roles);
    } catch (err) {
      console.error("Failed to fetch assignable roles:", err);
    }
  };

  const handleCreate = async () => {
    if (
      !formData.userName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      alert("Please fill in required fields (Username, Email, Password)");
      return;
    }

    try {
      await createUser(formData);
      setShowCreateModal(false);
      resetForm();
      await fetchUsers();
      alert("User created successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser || !formData.userName.trim() || !formData.email.trim()) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const updateData: IdentityUserUpdateDto = {
        userName: formData.userName,
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        isActive: formData.isActive,
        lockoutEnabled: formData.lockoutEnabled,
        roleNames: formData.roleNames,
      };
      await updateUser(selectedUser.id, updateData);
      setShowEditModal(false);
      resetForm();
      await fetchUsers();
      alert("User updated successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      await fetchUsers();
      alert("User deleted successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleOpenRoleModal = async (user: IdentityUserDto) => {
    setSelectedUser(user);
    try {
      const roles = await getUserRoles(user.id);
      setUserRoles(roles.map((r) => r.name));
      setShowRoleModal(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user roles"
      );
    }
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRoles(selectedUser.id, { roleNames: userRoles });
      setShowRoleModal(false);
      await fetchUsers();
      alert("User roles updated successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user roles");
    }
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      password: "",
      isActive: true,
      lockoutEnabled: false,
      roleNames: [],
    });
    setSelectedUser(null);
  };

  const handleEdit = (user: IdentityUserDto) => {
    setSelectedUser(user);
    setFormData({
      userName: user.userName,
      name: user.name || "",
      surname: user.surname || "",
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      password: "", // Don't include password for update
      isActive: user.isActive,
      lockoutEnabled: user.lockoutEnabled,
      roleNames: user.roles?.map((r) => r.name) || [],
    });
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="admin-users">
        <div className="admin-users-header">
          <h1>User Management</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            Create User
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
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Active</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.userName}</td>
                    <td>
                      {user.name} {user.surname}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || "-"}</td>
                    <td>{user.isActive ? "Yes" : "No"}</td>
                    <td>{user.roles?.map((r) => r.name).join(", ") || "-"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleOpenRoleModal(user)}
                      >
                        Manage Roles
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage - 1,
                  })
                }
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of{" "}
                {Math.ceil(totalCount / pagination.maxResultCount) || 1}
              </span>
              <button
                disabled={
                  pagination.currentPage >=
                  Math.ceil(totalCount / pagination.maxResultCount)
                }
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage + 1,
                  })
                }
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCreateModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Create User</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
              >
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Surname</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    Active
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit User</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
              >
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Surname</label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) =>
                      setFormData({ ...formData, surname: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    Active
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Role Management Modal */}
        {showRoleModal && selectedUser && (
          <div
            className="modal-overlay"
            onClick={() => setShowRoleModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Manage Roles for {selectedUser.userName}</h2>
              <div className="role-checkboxes">
                {assignableRoles.map((role) => (
                  <label key={role.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={userRoles.includes(role.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUserRoles([...userRoles, role.name]);
                        } else {
                          setUserRoles(
                            userRoles.filter((r) => r !== role.name)
                          );
                        }
                      }}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleUpdateRoles}>
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
