using Nexus.ServiceDesk.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;
using Volo.Abp.MultiTenancy;

namespace Nexus.ServiceDesk.Permissions;

public class ServiceDeskPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        // IMPORTANT: This method is REQUIRED by ABP framework (abstract method)
        // However, with SaveStaticPermissionsToDatabase = false configured in ServiceDeskWebModule,
        // these definitions will NOT be written to AbpPermissions table
        // 
        // Permissions are already defined in AbpPermissions table in database.
        // This method is only for:
        // 1. Runtime permission checking (ABP framework needs to know permission structure)
        // 2. Permission validation and authorization
        // 
        // The actual permission grants (which role has which permission) are stored in 
        // AbpPermissionGrants table and can be queried dynamically using DynamicPermissionAppService
        //
        // NOTE: Keep this method in sync with permissions in AbpPermissions table
        // If you add new permissions in database, also add them here for runtime checking

        var serviceDeskGroup = context.AddGroup(ServiceDeskPermissions.GroupName, L("Permission:ServiceDesk"));

        // RepairRequests permissions group
        var repairRequestsGroup = serviceDeskGroup.AddPermission(ServiceDeskPermissions.RepairRequests, L("Permission:RepairRequests"));

        // Teacher permissions
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsCreate, L("Permission:RepairRequests.Create"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsUpdate, L("Permission:RepairRequests.Update"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsCancel, L("Permission:RepairRequests.Cancel"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsMyList, L("Permission:RepairRequests.MyList"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsDetail, L("Permission:RepairRequests.Detail"));

        // Electrician permissions
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsQuote, L("Permission:RepairRequests.Quote"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsElectricianList, L("Permission:RepairRequests.ElectricianList"));

        // Admin permissions
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsAdminList, L("Permission:RepairRequests.AdminList"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsApprove, L("Permission:RepairRequests.Approve"));
        repairRequestsGroup.AddChild(ServiceDeskPermissions.RepairRequestsReject, L("Permission:RepairRequests.Reject"));

        // Menu management permissions
        serviceDeskGroup.AddPermission(ServiceDeskPermissions.MenusManage, L("Permission:Menus.Manage"));
        serviceDeskGroup.AddPermission(ServiceDeskPermissions.RoleMenusManage, L("Permission:RoleMenus.Manage"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<ServiceDeskResource>(name);
    }
}
