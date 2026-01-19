using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Volo.Abp;
using Nexus.ServiceDesk.Permissions;
using Nexus.ServiceDesk.AppMenus;
using Nexus.ServiceDesk.Menus;
using Nexus.ServiceDesk.Menus.DTOs;

namespace Nexus.ServiceDesk.Menus;

[Authorize(ServiceDeskPermissions.RoleMenusManage)]
public class AdminRoleMenuAppService : ServiceDeskAppService, IAdminRoleMenuAppService
{
    private readonly IRepository<AppRoleMenu> _roleMenuRepository;
    private readonly IRepository<AppMenu, Guid> _menuRepository;
    private readonly IIdentityRoleRepository _roleRepository;
    // Use direct mapper instance instead of ABP ObjectMapper
    private static readonly ServiceDeskApplicationMappers _myMapper = new();

    public AdminRoleMenuAppService(
        IRepository<AppRoleMenu> roleMenuRepository,
        IRepository<AppMenu, Guid> menuRepository,
        IIdentityRoleRepository roleRepository)
    {
        _roleMenuRepository = roleMenuRepository;
        _menuRepository = menuRepository;
        _roleRepository = roleRepository;
    }

    [Authorize(ServiceDeskPermissions.RoleMenusManage)]
    public async Task<List<AppMenuDto>> GetByRoleAsync(Guid roleId)
    {
        var roleMenus = await _roleMenuRepository.GetListAsync(x => x.RoleId == roleId);
        var menuIds = roleMenus.Select(x => x.MenuId).ToList();

        if (menuIds.Count == 0)
        {
            return new List<AppMenuDto>();
        }

        var menus = await _menuRepository.GetListAsync(x => menuIds.Contains(x.Id) && x.IsEnabled);
        // Use direct mapper instance instead of ABP ObjectMapper
        var menuDtos = menus.Select(m => _myMapper.Map(m)).ToList();

        // Build tree structure
        var rootMenus = menuDtos.Where(x => x.ParentId == null || !menuIds.Contains(x.ParentId.Value))
            .OrderBy(x => x.SortOrder).ToList();
        var childMenus = menuDtos.Where(x => x.ParentId != null && menuIds.Contains(x.ParentId.Value)).ToList();

        foreach (var rootMenu in rootMenus)
        {
            BuildMenuTree(rootMenu, childMenus, menuIds);
        }

        return rootMenus;
    }

    [Authorize(ServiceDeskPermissions.RoleMenusManage)]
    public async Task SaveAsync(SetRoleMenusDto input)
    {
        // Get role information for validation
        var role = await _roleRepository.GetAsync(input.RoleId);
        var roleNameUpper = role.Name?.ToUpper() ?? "";

        // Get menu information for validation
        if (input.MenuIds != null && input.MenuIds.Count > 0)
        {
            var menus = await _menuRepository.GetListAsync(x => input.MenuIds.Contains(x.Id));

            // Validate: Prevent cross-role menu assignments
            // Check if menu codes match the role name pattern
            foreach (var menu in menus)
            {
                var menuCodeUpper = menu.Code?.ToUpper() ?? "";

                // Prevent Teacher role from getting Electrician menus
                if (menuCodeUpper.Contains("ELECTRICIAN") && !roleNameUpper.Contains("ELECTRICIAN") && !roleNameUpper.Contains("ADMIN"))
                {
                    throw new BusinessException(
                        "InvalidMenuAssignment",
                        $"Cannot assign menu '{menu.Name}' (Code: {menu.Code}) to role '{role.Name}'. " +
                        $"This menu is intended for Electrician role only.");
                }

                // Prevent Electrician role from getting Teacher menus
                if (menuCodeUpper.Contains("TEACHER") && !roleNameUpper.Contains("TEACHER") && !roleNameUpper.Contains("ADMIN"))
                {
                    throw new BusinessException(
                        "InvalidMenuAssignment",
                        $"Cannot assign menu '{menu.Name}' (Code: {menu.Code}) to role '{role.Name}'. " +
                        $"This menu is intended for Teacher role only.");
                }

                // Prevent Admin role from getting role-specific menus (optional, can be removed if Admin should have all menus)
                // Uncomment if you want to restrict Admin from getting role-specific menus
                // if (roleNameUpper.Contains("ADMIN"))
                // {
                //     if (menuCodeUpper.Contains("ELECTRICIAN") || menuCodeUpper.Contains("TEACHER"))
                //     {
                //         throw new BusinessException(
                //             "InvalidMenuAssignment",
                //             $"Admin role should not be assigned role-specific menus like '{menu.Name}'.");
                //     }
                // }
            }
        }

        // Remove existing role-menu mappings
        var existingMappings = await _roleMenuRepository.GetListAsync(x => x.RoleId == input.RoleId);
        foreach (var mapping in existingMappings)
        {
            await _roleMenuRepository.DeleteAsync(mapping);
        }

        // Add new role-menu mappings
        if (input.MenuIds != null)
        {
            foreach (var menuId in input.MenuIds)
            {
                var roleMenu = new AppRoleMenu(input.RoleId, menuId);
                await _roleMenuRepository.InsertAsync(roleMenu);
            }
        }
    }

    private void BuildMenuTree(AppMenuDto parent, List<AppMenuDto> allMenus, List<Guid> allowedMenuIds)
    {
        var children = allMenus.Where(x => x.ParentId == parent.Id).OrderBy(x => x.SortOrder).ToList();
        parent.Children = children;

        foreach (var child in children)
        {
            BuildMenuTree(child, allMenus, allowedMenuIds);
        }
    }
}
