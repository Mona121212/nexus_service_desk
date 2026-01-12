import http from './http';
import { Menu } from '../types/menu';

interface GetMyMenusResponse {
  menus?: Menu[];
  Menus?: Menu[]; // Support both camelCase and PascalCase
}

export const getMyMenus = async (): Promise<Menu[]> => {
  try {
    const response = await http.get<GetMyMenusResponse>('/api/app/menu/my-menus');
    // Support both camelCase and PascalCase from backend
    return response.data.menus || response.data.Menus || [];
  } catch (error) {
    throw error;
  }
};
