import http from './http';
import axios from 'axios';
import { RepairRequest } from '../types/repair';
import {
  AppMenuDto,
  CreateAppMenuDto,
  UpdateAppMenuDto,
  SetRoleMenusDto,
  Role,
  PagedResult,
  GetRepairRequestListInput,
  ApproveRepairRequestDto,
  RejectRepairRequestDto,
  IdentityUserDto,
  IdentityUserCreateDto,
  IdentityUserUpdateDto,
  IdentityUserUpdateRolesDto,
  GetIdentityUsersInput,
  IdentityRoleDto,
  IdentityRoleCreateDto,
  IdentityRoleUpdateDto,
  GetIdentityRolesInput,
  GetPermissionListResultDto,
  UpdatePermissionsDto,
} from '../types/admin';

// ==================== Admin Repair Request APIs ====================

/**
 * Get all repair requests (Admin list)
 */
export const getAdminRepairRequests = async (
  input?: GetRepairRequestListInput
): Promise<PagedResult<RepairRequest>> => {
  try {
    const response = await http.get<PagedResult<RepairRequest>>(
      '/api/app/admin-repair-request',
      {
        params: {
          skipCount: input?.skipCount || 0,
          maxResultCount: input?.maxResultCount || 10,
          sorting: input?.sorting,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch repair requests';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get pending approvals (Admin approvals list)
 */
export const getAdminApprovals = async (
  input?: GetRepairRequestListInput
): Promise<PagedResult<RepairRequest>> => {
  try {
    const response = await http.get<PagedResult<RepairRequest>>(
      '/api/app/admin-repair-request/approvals',
      {
        params: {
          skipCount: input?.skipCount || 0,
          maxResultCount: input?.maxResultCount || 10,
          sorting: input?.sorting,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch approvals';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Approve a repair request
 */
export const approveRepairRequest = async (
  id: string,
  input: ApproveRepairRequestDto
): Promise<RepairRequest> => {
  try {
    const response = await http.post<RepairRequest>(
      `/api/app/admin-repair-request/${id}/approve`,
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to approve repair request';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Reject a repair request
 */
export const rejectRepairRequest = async (
  id: string,
  input: RejectRepairRequestDto
): Promise<RepairRequest> => {
  try {
    const response = await http.post<RepairRequest>(
      `/api/app/admin-repair-request/${id}/reject`,
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to reject repair request';
      throw new Error(message);
    }
    throw error;
  }
};

// ==================== Admin Menu APIs ====================

/**
 * Get all menus (Admin menu list)
 */
export const getAdminMenus = async (): Promise<AppMenuDto[]> => {
  try {
    const response = await http.get<AppMenuDto[]>('/api/app/admin-menu');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch menus';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Create a new menu
 */
export const createAdminMenu = async (
  input: CreateAppMenuDto
): Promise<AppMenuDto> => {
  try {
    const response = await http.post<AppMenuDto>('/api/app/admin-menu', input);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create menu';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Update a menu
 */
export const updateAdminMenu = async (
  id: string,
  input: UpdateAppMenuDto
): Promise<AppMenuDto> => {
  try {
    const response = await http.put<AppMenuDto>(
      `/api/app/admin-menu/${id}`,
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update menu';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Delete a menu
 */
export const deleteAdminMenu = async (id: string): Promise<void> => {
  try {
    await http.delete(`/api/app/admin-menu/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to delete menu';
      throw new Error(message);
    }
    throw error;
  }
};

// ==================== Admin Role Menu APIs ====================

/**
 * Get menus by role
 */
export const getRoleMenus = async (roleId: string): Promise<AppMenuDto[]> => {
  try {
    const response = await http.get<AppMenuDto[]>(
      `/api/app/admin-role-menu/by-role/${roleId}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch role menus';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Save role menu configuration
 */
export const saveRoleMenus = async (
  input: SetRoleMenusDto
): Promise<void> => {
  try {
    await http.post('/api/app/admin-role-menu/save', input);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to save role menus';
      throw new Error(message);
    }
    throw error;
  }
};

// ==================== Role APIs ====================

/**
 * Get all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await http.get<any>('/api/identity/roles/all');
    // Handle different response formats from ABP framework
    // ABP may return either an array directly or a wrapped object
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // If it's a wrapped object, try common property names
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (data && Array.isArray(data.result)) {
      return data.result;
    }
    // If still not an array, return empty array and log warning
    console.warn('Unexpected response format from /api/identity/roles/all:', data);
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch roles';
      throw new Error(message);
    }
    throw error;
  }
};

// ==================== User Management APIs ====================

/**
 * Get users list
 */
export const getUsers = async (
  input?: GetIdentityUsersInput
): Promise<PagedResult<IdentityUserDto>> => {
  try {
    const response = await http.get<any>(
      '/api/identity/users',
      {
        params: {
          filter: input?.filter,
          sorting: input?.sorting,
          skipCount: input?.skipCount || 0,
          maxResultCount: input?.maxResultCount || 10,
        },
      }
    );
    const data = response.data;

    // Ensure items array exists and normalize roles field for each user
    if (data && data.items && Array.isArray(data.items)) {
      data.items = data.items.map((user: any) => {
        // Normalize roles field - ensure it's always an array or undefined
        if (user.roles !== undefined && user.roles !== null) {
          if (Array.isArray(user.roles)) {
            // Already an array, keep it
            return user;
          } else {
            // Not an array, set to undefined
            user.roles = undefined;
          }
        }
        return user;
      });
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch users';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get user by id
 */
export const getUserById = async (id: string): Promise<IdentityUserDto> => {
  try {
    const response = await http.get<IdentityUserDto>(
      `/api/identity/users/${id}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch user';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  input: IdentityUserCreateDto
): Promise<IdentityUserDto> => {
  try {
    const response = await http.post<IdentityUserDto>(
      '/api/identity/users',
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create user';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Update user
 */
export const updateUser = async (
  id: string,
  input: IdentityUserUpdateDto
): Promise<IdentityUserDto> => {
  try {
    const response = await http.put<IdentityUserDto>(
      `/api/identity/users/${id}`,
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update user';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await http.delete(`/api/identity/users/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to delete user';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get user roles
 */
export const getUserRoles = async (id: string): Promise<IdentityRoleDto[]> => {
  try {
    const response = await http.get<any>(
      `/api/identity/users/${id}/roles`
    );
    const data = response.data;

    // Handle different response formats from ABP framework
    // ABP may return either an array directly or a wrapped object
    if (Array.isArray(data)) {
      return data;
    }
    // If it's a wrapped object, try common property names
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (data && Array.isArray(data.result)) {
      return data.result;
    }
    // If still not an array, return empty array and log warning
    console.warn('Unexpected response format from getUserRoles:', data);
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch user roles';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Update user roles
 */
export const updateUserRoles = async (
  id: string,
  input: IdentityUserUpdateRolesDto
): Promise<void> => {
  try {
    await http.put(`/api/identity/users/${id}/roles`, input);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update user roles';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get assignable roles
 */
export const getAssignableRoles = async (): Promise<IdentityRoleDto[]> => {
  try {
    const response = await http.get<any>(
      '/api/identity/users/assignable-roles'
    );
    const data = response.data;

    // Handle different response formats from ABP framework
    // ABP may return either an array directly or a wrapped object
    if (Array.isArray(data)) {
      return data;
    }
    // If it's a wrapped object, try common property names
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    if (data && Array.isArray(data.result)) {
      return data.result;
    }
    // If still not an array, return empty array and log warning
    console.warn('Unexpected response format from getAssignableRoles:', data);
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch assignable roles';
      throw new Error(message);
    }
    throw error;
  }
};

// ==================== Role Management APIs ====================

/**
 * Get roles list (with pagination)
 */
export const getRolesList = async (
  input?: GetIdentityRolesInput
): Promise<PagedResult<IdentityRoleDto>> => {
  try {
    const response = await http.get<PagedResult<IdentityRoleDto>>(
      '/api/identity/roles',
      {
        params: {
          filter: input?.filter,
          sorting: input?.sorting,
          skipCount: input?.skipCount || 0,
          maxResultCount: input?.maxResultCount || 10,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch roles';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get role by id
 */
export const getRoleById = async (id: string): Promise<IdentityRoleDto> => {
  try {
    const response = await http.get<IdentityRoleDto>(
      `/api/identity/roles/${id}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch role';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Create a new role
 */
export const createRole = async (
  input: IdentityRoleCreateDto
): Promise<IdentityRoleDto> => {
  try {
    const response = await http.post<IdentityRoleDto>(
      '/api/identity/roles',
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to create role';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Update role
 */
export const updateRole = async (
  id: string,
  input: IdentityRoleUpdateDto
): Promise<IdentityRoleDto> => {
  try {
    const response = await http.put<IdentityRoleDto>(
      `/api/identity/roles/${id}`,
      input
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update role';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Delete role
 */
export const deleteRole = async (id: string): Promise<void> => {
  try {
    await http.delete(`/api/identity/roles/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to delete role';
      throw new Error(message);
    }
    throw error;
  }
};

// ==================== Permission Management APIs ====================

/**
 * Get permissions for role or user
 * @param providerName 'R' for Role, 'U' for User
 * @param providerKey Role name or User ID
 */
export const getPermissions = async (
  providerName: string,
  providerKey: string
): Promise<GetPermissionListResultDto> => {
  try {
    const response = await http.get<GetPermissionListResultDto>(
      '/api/permission-management/permissions',
      {
        params: {
          providerName,
          providerKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to fetch permissions';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Update permissions for role or user
 * @param providerName 'R' for Role, 'U' for User
 * @param providerKey Role name or User ID
 */
export const updatePermissions = async (
  providerName: string,
  providerKey: string,
  input: UpdatePermissionsDto
): Promise<void> => {
  try {
    // Note: This API returns 204 No Content on success, which is normal
    // 204 means the request was successful but there's no response body
    await http.put(
      '/api/permission-management/permissions',
      input,
      {
        params: {
          providerName,
          providerKey,
        },
      }
    );
    // 204 No Content is a successful response, no need to check response.data
    // The request completed successfully if we reach here
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // For 204 responses, error.response.data will be empty, so check status first
      if (error.response?.status === 204) {
        // 204 is actually success, not an error
        return;
      }
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update permissions';
      throw new Error(message);
    }
    throw error;
  }
};
