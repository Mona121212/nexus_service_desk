using System;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Identity;
using Volo.Abp.Uow;
using Nexus.ServiceDesk.AppMenus;

namespace Nexus.ServiceDesk.Menus;

public class MenuDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IRepository<AppMenu, Guid> _menuRepository;
    private readonly IRepository<AppRoleMenu> _roleMenuRepository;
    private readonly IIdentityRoleRepository _roleRepository;
    private readonly IGuidGenerator _guidGenerator;

    public MenuDataSeedContributor(
        IRepository<AppMenu, Guid> menuRepository,
        IRepository<AppRoleMenu> roleMenuRepository,
        IIdentityRoleRepository roleRepository,
        IGuidGenerator guidGenerator)
    {
        _menuRepository = menuRepository;
        _roleMenuRepository = roleMenuRepository;
        _roleRepository = roleRepository;
        _guidGenerator = guidGenerator;
    }

    [UnitOfWork]
    public async Task SeedAsync(DataSeedContext context)
    {
        await CreateMenusAndAssignToRolesAsync();
    }

    private async Task CreateMenusAndAssignToRolesAsync()
    {
        // Create Teacher menus
        var teacherMyRepairsMenu = await CreateMenuIfNotExistsAsync(
            "TEACHER_MY_REPAIRS",
            "My Repairs",
            "/repairs",
            sortOrder: 1
        );

        var teacherCreateRepairMenu = await CreateMenuIfNotExistsAsync(
            "TEACHER_CREATE_REPAIR",
            "Create Repair",
            "/repairs/create",
            sortOrder: 2
        );

        // Create Electrician menu
        var electricianPendingRepairsMenu = await CreateMenuIfNotExistsAsync(
            "ELECTRICIAN_PENDING_REPAIRS",
            "Pending Repairs",
            "/electrician/repairs",
            sortOrder: 1
        );

        // Assign menus to roles
        var teacherRole = await _roleRepository.FindByNormalizedNameAsync("TEACHER");
        if (teacherRole != null)
        {
            await AssignMenuToRoleIfNotExistsAsync(teacherRole.Id, teacherMyRepairsMenu.Id);
            await AssignMenuToRoleIfNotExistsAsync(teacherRole.Id, teacherCreateRepairMenu.Id);
        }

        var electricianRole = await _roleRepository.FindByNormalizedNameAsync("ELECTRICIAN");
        if (electricianRole != null)
        {
            await AssignMenuToRoleIfNotExistsAsync(electricianRole.Id, electricianPendingRepairsMenu.Id);
        }
    }

    private async Task<AppMenu> CreateMenuIfNotExistsAsync(
        string code,
        string name,
        string? path = null,
        string? icon = null,
        int sortOrder = 0)
    {
        var existingMenu = await _menuRepository.FindAsync(x => x.Code == code);
        if (existingMenu != null)
        {
            return existingMenu;
        }

        var menu = new AppMenu(
            _guidGenerator.Create(),
            code,
            name
        )
        {
            Path = path,
            Icon = icon,
            SortOrder = sortOrder,
            IsEnabled = true
        };

        await _menuRepository.InsertAsync(menu);
        return menu;
    }

    private async Task AssignMenuToRoleIfNotExistsAsync(Guid roleId, Guid menuId)
    {
        var existing = await _roleMenuRepository.FindAsync(x => x.RoleId == roleId && x.MenuId == menuId);
        if (existing != null)
        {
            return;
        }

        var roleMenu = new AppRoleMenu(roleId, menuId);
        await _roleMenuRepository.InsertAsync(roleMenu);
    }
}