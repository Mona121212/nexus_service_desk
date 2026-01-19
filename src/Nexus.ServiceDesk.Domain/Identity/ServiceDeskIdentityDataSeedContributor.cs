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

public class ServiceDeskIdentityDataSeedContributor : ITransientDependency
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
    /*public async Task SeedAsync(DataSeedContext context)
    {
        await CreateRolesAndAssignPermissionsAsync();
    }*/
    
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

    
}