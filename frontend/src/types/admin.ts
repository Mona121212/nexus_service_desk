// Admin related types

export interface AppMenuDto {
  id: string;
  code: string;
  name: string;
  path?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isEnabled: boolean;
  children?: AppMenuDto[];
  creationTime?: string;
  lastModificationTime?: string;
}

export interface CreateAppMenuDto {
  code: string;
  name: string;
  path?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface UpdateAppMenuDto {
  name: string;
  path?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isEnabled: boolean;
}

export interface SetRoleMenusDto {
  roleId: string;
  menuIds: string[];
}

export interface Role {
  id: string;
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface GetRepairRequestListInput {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}

export interface ApproveRepairRequestDto {
  adminDecisionNote?: string;
}

export interface RejectRepairRequestDto {
  adminDecisionNote: string;
}
