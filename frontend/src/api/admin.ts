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
    const response = await http.get<Role[]>('/api/identity/roles/all');
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
