import http from './http';
import { RepairRequest } from '../types/repair';
import axios from 'axios';

export const getMyRepairs = async (pageNum: number = 1, pageSize: number = 10): Promise<RepairRequest[]> => {
    try {
        // Use axios params object instead of manual URLSearchParams for cleaner code
        const response = await http.get<{ items: RepairRequest[] }>(
            '/api/app/repair-request/my-list',
            {
                params: {
                    skipCount: (pageNum - 1) * pageSize,
                    maxResultCount: pageSize
                }
            }
        );
        return response.data.items || [];
    } catch (error) {
        throw error;
    }
};

export const createRepair = async (data: {
    title: string;
    description: string;
    building: string;
    room: string
}): Promise<RepairRequest> => {
    try {
        // Ensure this matches the POST /api/app/repair-request exactly
        const response = await http.post<RepairRequest>('/api/app/repair-request', data);
        return response.data;
    } catch (error) {
        // Check console to see exact validation errors from ABP
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            console.error("ABP Validation Errors:", error.response.data.error.validationErrors);
        }
        throw error;
    }
};

export const getRepairDetail = async (id: string): Promise<RepairRequest> => {
  try {
    const response = await http.get<RepairRequest>(`/api/app/repair-request/${id}/detail`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRepair = async (id: string, data: { title: string; description: string }): Promise<RepairRequest> => {
  try {
    const response = await http.put<RepairRequest>(`/api/app/repair-request/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelRepair = async (id: string): Promise<void> => {
  try {
    await http.post(`/api/app/repair-request/${id}/cancel`);
  } catch (error) {
    throw error;
  }
};
