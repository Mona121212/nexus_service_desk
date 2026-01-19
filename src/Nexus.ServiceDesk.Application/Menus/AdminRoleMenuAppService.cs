using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
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
        // Validate input
        if (input == null)
        {
            throw new ArgumentNullException(nameof(input));
        }

        // Get role information
        var role = await _roleRepository.GetAsync(input.RoleId);

        // Log the operation for debugging
        Logger?.LogInformation(
            "SaveAsync: Saving role-menu mappings for RoleId={RoleId}, RoleName={RoleName}, MenuCount={MenuCount}",
            input.RoleId,
            role.Name,
            input.MenuIds?.Count ?? 0);

        // Remove existing role-menu mappings
        var existingMappings = await _roleMenuRepository.GetListAsync(x => x.RoleId == input.RoleId);
        Logger?.LogInformation(
            "SaveAsync: Found {ExistingCount} existing role-menu mappings for RoleId={RoleId}",
            existingMappings.Count,
            input.RoleId);

        // Delete existing mappings
        if (existingMappings.Count > 0)
        {
            foreach (var mapping in existingMappings)
            {
                await _roleMenuRepository.DeleteAsync(mapping);
            }
        }

        // Add new role-menu mappings from database configuration
        if (input.MenuIds != null && input.MenuIds.Count > 0)
        {
            foreach (var menuId in input.MenuIds)
            {
                var roleMenu = new AppRoleMenu(input.RoleId, menuId);
                await _roleMenuRepository.InsertAsync(roleMenu);
            }

            Logger?.LogInformation(
                "SaveAsync: Successfully saved {NewCount} role-menu mappings for RoleId={RoleId}",
                input.MenuIds.Count,
                input.RoleId);
        }
        else
        {
            Logger?.LogInformation(
                "SaveAsync: No menus to assign, all role-menu mappings removed for RoleId={RoleId}",
                input.RoleId);
        }

        // Trigger menu update event so frontend can refresh
        // This notifies connected clients to refresh their menu data
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
