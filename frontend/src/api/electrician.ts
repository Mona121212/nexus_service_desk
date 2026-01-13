import http from './http';
import { RepairRequest } from '../types/repair';
import axios from 'axios';

export interface ElectricianRepairListResponse {
  items: RepairRequest[];
  totalCount: number;
}

export interface QuoteRequest {
  quotedAmount: number;
  currency?: string;
  electricianNote?: string;
}

/**
 * Get list of repair requests for electrician
 * @param pageNum Page number (1-based)
 * @param pageSize Page size
 * @returns List of repair requests
 */
export const getElectricianRepairList = async (
  pageNum: number = 1,
  pageSize: number = 10
): Promise<ElectricianRepairListResponse> => {
  try {
    const response = await http.get<ElectricianRepairListResponse>(
      '/api/app/electrician-repair-request',
      {
        params: {
          skipCount: (pageNum - 1) * pageSize,
          maxResultCount: pageSize,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit quote for a repair request
 * @param id Repair request ID
 * @param quote Quote data
 * @returns Updated repair request
 */
export const submitQuote = async (
  id: string,
  quote: QuoteRequest
): Promise<RepairRequest> => {
  try {
    const response = await http.post<RepairRequest>(
      `/api/app/electrician-repair-request/${id}/quote`,
      quote
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        console.error('ABP Validation Errors:', error.response.data.error.validationErrors);
        const validationErrors = error.response.data.error.validationErrors;
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          const firstError = Object.values(validationErrors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        }
      }
      const message = error.response?.data?.error?.message 
        || error.response?.data?.error?.details
        || error.message 
        || 'Failed to submit quote';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Update quote for a repair request
 * @param id Repair request ID
 * @param quote Quote data
 * @returns Updated repair request
 */
export const updateQuote = async (
  id: string,
  quote: QuoteRequest
): Promise<RepairRequest> => {
  try {
    const response = await http.put<RepairRequest>(
      `/api/app/electrician-repair-request/${id}/quote`,
      quote
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.error) {
        console.error('ABP Validation Errors:', error.response.data.error.validationErrors);
        const validationErrors = error.response.data.error.validationErrors;
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          const firstError = Object.values(validationErrors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
        }
      }
      const message = error.response?.data?.error?.message 
        || error.response?.data?.error?.details
        || error.message 
        || 'Failed to update quote';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Get repair request detail
 * @param id Repair request ID
 * @returns Repair request detail
 */
export const getElectricianRepairDetail = async (
  id: string
): Promise<RepairRequest> => {
  try {
    const response = await http.get<RepairRequest>(
      `/api/app/repair-request/${id}/detail`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error("You don't have permission to view this repair request.");
      }
      const message = error.response?.data?.error?.message 
        || error.response?.data?.error?.details
        || error.message 
        || 'Failed to fetch repair details';
      throw new Error(message);
    }
    throw error;
  }
};

/**
 * Delete repair request (if not yet approved)
 * Note: This endpoint may not exist in backend, check backend implementation
 * @param id Repair request ID
 */
export const deleteElectricianRepair = async (id: string): Promise<void> => {
  try {
    await http.delete(`/api/app/electrician-repair-request/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message 
        || error.response?.data?.error?.details
        || error.message 
        || 'Failed to delete repair request';
      throw new Error(message);
    }
    throw error;
  }
};
