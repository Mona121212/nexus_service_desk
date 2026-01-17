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

// ==================== User Management Types ====================

export interface IdentityUserDto {
  id: string;
  userName: string;
  name?: string;
  surname?: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  isActive: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  roles?: IdentityRoleDto[];
  creationTime?: string;
  lastModificationTime?: string;
}

export interface IdentityUserCreateDto {
  userName: string;
  name?: string;
  surname?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  roleNames?: string[];
}

export interface IdentityUserUpdateDto {
  userName: string;
  name?: string;
  surname?: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  lockoutEnabled: boolean;
  roleNames?: string[];
}

export interface IdentityUserUpdateRolesDto {
  roleNames: string[];
}

export interface GetIdentityUsersInput {
  filter?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

// ==================== Role Management Types ====================

export interface IdentityRoleDto {
  id: string;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  isStatic?: boolean;
}

export interface IdentityRoleCreateDto {
  name: string;
  isDefault: boolean;
  isPublic: boolean;
}

export interface IdentityRoleUpdateDto {
  name: string;
  isDefault: boolean;
  isPublic: boolean;
}

export interface GetIdentityRolesInput {
  filter?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

// ==================== Permission Management Types ====================

export interface PermissionGrantInfoDto {
  name: string;
  displayName?: string;
  parentName?: string;
  isGranted: boolean;
  allowedProviders?: string[];
  grantedProviders?: PermissionProviderInfoDto[];
}

export interface PermissionGroupDto {
  name: string;
  displayName?: string;
  displayNameKey?: string;
  permissions?: PermissionGrantInfoDto[];
}

export interface GetPermissionListResultDto {
  entityDisplayName?: string;
  groups?: PermissionGroupDto[];
}

export interface UpdatePermissionsDto {
  permissions: UpdatePermissionDto[];
}

export interface UpdatePermissionDto {
  name: string;
  isGranted: boolean;
}

export interface PermissionProviderInfoDto {
  providerName: string;
  providerKey?: string;
}