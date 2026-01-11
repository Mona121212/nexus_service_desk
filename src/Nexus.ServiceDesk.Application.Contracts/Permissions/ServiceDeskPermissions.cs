namespace Nexus.ServiceDesk.Permissions;

public static class ServiceDeskPermissions
{
    public const string GroupName = "ServiceDesk";

    // RepairRequests permissions
    public const string RepairRequests = GroupName + ".RepairRequests";
    public const string RepairRequestsCreate = RepairRequests + ".Create";
    public const string RepairRequestsUpdate = RepairRequests + ".Update";
    public const string RepairRequestsCancel = RepairRequests + ".Cancel";
    public const string RepairRequestsMyList = RepairRequests + ".MyList";
    public const string RepairRequestsDetail = RepairRequests + ".Detail";

    // Electrician permissions
    public const string RepairRequestsQuote = RepairRequests + ".Quote";
    public const string RepairRequestsElectricianList = RepairRequests + ".ElectricianList";

    // Admin permissions
    public const string RepairRequestsAdminList = RepairRequests + ".AdminList";
    public const string RepairRequestsApprove = RepairRequests + ".Approve";
    public const string RepairRequestsReject = RepairRequests + ".Reject";
    public const string MenusManage = GroupName + ".Menus.Manage";
    public const string RoleMenusManage = GroupName + ".RoleMenus.Manage";
}
