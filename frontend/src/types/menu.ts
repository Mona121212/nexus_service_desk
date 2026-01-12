export interface Menu {
  id: string;
  name: string;
  path: string;
  icon?: string;
  sortOrder: number;
  isEnabled: boolean;
  children?: Menu[];
}

export type MenuList = Menu[];
