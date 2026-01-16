/**
 * Frontend permission constants
 * Must match exactly with backend ServiceDeskPermissions.cs
 */
export const Permissions = {
  GroupName: 'ServiceDesk',
  
  // RepairRequests permissions
  RepairRequests: {
    Default: 'ServiceDesk.RepairRequests',
    Create: 'ServiceDesk.RepairRequests.Create',
    Update: 'ServiceDesk.RepairRequests.Update',
    Cancel: 'ServiceDesk.RepairRequests.Cancel',
    MyList: 'ServiceDesk.RepairRequests.MyList',
    Detail: 'ServiceDesk.RepairRequests.Detail',
    
    // Electrician permissions
    Quote: 'ServiceDesk.RepairRequests.Quote',
    ElectricianList: 'ServiceDesk.RepairRequests.ElectricianList',
    
    // Admin permissions
    AdminList: 'ServiceDesk.RepairRequests.AdminList',
    Approve: 'ServiceDesk.RepairRequests.Approve',
    Reject: 'ServiceDesk.RepairRequests.Reject',
  },
  
  // Menus permissions
  Menus: {
    Manage: 'ServiceDesk.Menus.Manage',
  },
  
  // RoleMenus permissions
  RoleMenus: {
    Manage: 'ServiceDesk.RoleMenus.Manage',
  },
} as const;
