import http from "./http";
import { Menu } from "../types/menu";

interface GetMyMenusResponse {
  menus?: Menu[];
  Menus?: Menu[]; // 支持 PascalCase（来自 .NET 后端）
}

export const getMyMenus = async (): Promise<Menu[]> => {
  try {
    const response = await http.get<GetMyMenusResponse>(
      "/api/app/menu/my-menus",
    );

    // 支持后端返回的两种格式
    const menuData = response.data.menus || response.data.Menus || [];

    console.log("getMyMenus response:", menuData);

    return menuData;
  } catch (error) {
    console.error("Error fetching menus:", error);
    throw error;
  }
};
