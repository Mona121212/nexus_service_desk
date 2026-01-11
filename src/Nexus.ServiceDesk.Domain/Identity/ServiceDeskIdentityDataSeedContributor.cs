using System;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.Uow;
using Nexus.ServiceDesk.Permissions;

namespace Nexus.ServiceDesk.Identity;

public class ServiceDeskIdentityDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IIdentityRoleRepository _roleRepository;
    private readonly IdentityRoleManager _roleManager;
    private readonly IPermissionManager _permissionManager;
    private readonly IGuidGenerator _guidGenerator;

    public ServiceDeskIdentityDataSeedContributor(
        IIdentityRoleRepository roleRepository,
        IdentityRoleManager roleManager,
        IPermissionManager permissionManager,
        IGuidGenerator guidGenerator)
    {
        _roleRepository = roleRepository;
        _roleManager = roleManager;
        _permissionManager = permissionManager;
        _guidGenerator = guidGenerator;
    }

    [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        await CreateRolesAndAssignPermissionsAsync();
    }

    private async Task CreateRolesAndAssignPermissionsAsync()
    {
        // Create Teacher role
        var teacherRole = await CreateRoleIfNotExistsAsync("Teacher", "Teacher");
        if (teacherRole != null)
        {
            await GrantPermissionsToRoleAsync(teacherRole.Name!, new[]
            {
                ServiceDeskPermissions.RepairRequestsCreate,
                ServiceDeskPermissions.RepairRequestsUpdate,
                ServiceDeskPermissions.RepairRequestsCancel,
                ServiceDeskPermissions.RepairRequestsMyList
            });
        }

        // Create Electrician role
        var electricianRole = await CreateRoleIfNotExistsAsync("Electrician", "Electrician");
        if (electricianRole != null)
        {
            await GrantPermissionsToRoleAsync(electricianRole.Name!, new[]
            {
                ServiceDeskPermissions.RepairRequestsQuote,
                ServiceDeskPermissions.RepairRequestsElectricianList
            });
        }

        // Create Admin role
        var adminRole = await CreateRoleIfNotExistsAsync("Admin", "Admin");
        if (adminRole != null)
        {
            await GrantPermissionsToRoleAsync(adminRole.Name!, new[]
            {
                ServiceDeskPermissions.RepairRequestsAdminList,
                ServiceDeskPermissions.RepairRequestsApprove,
                ServiceDeskPermissions.RepairRequestsReject,
                ServiceDeskPermissions.MenusManage,
                ServiceDeskPermissions.RoleMenusManage
            });
        }
    }

    private async Task<IdentityRole?> CreateRoleIfNotExistsAsync(string roleName, string displayName)
    {
        var role = await _roleRepository.FindByNormalizedNameAsync(roleName.ToUpperInvariant());
        if (role == null)
        {
            role = new IdentityRole(
                _guidGenerator.Create(),
                roleName
            );

            await _roleManager.CreateAsync(role);
        }

        return role;
    }

    private async Task GrantPermissionsToRoleAsync(string roleName, string[] permissionNames)
    {
        foreach (var permissionName in permissionNames)
        {
            await _permissionManager.SetForRoleAsync(roleName, permissionName, true);
        }
    }
}
