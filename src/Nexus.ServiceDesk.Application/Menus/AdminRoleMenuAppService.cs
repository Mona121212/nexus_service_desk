using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
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

    public AdminRoleMenuAppService(
        IRepository<AppRoleMenu> roleMenuRepository,
        IRepository<AppMenu, Guid> menuRepository)
    {
        _roleMenuRepository = roleMenuRepository;
        _menuRepository = menuRepository;
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
        var menuDtos = ObjectMapper.Map<List<AppMenu>, List<AppMenuDto>>(menus);

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
        // Remove existing role-menu mappings
        var existingMappings = await _roleMenuRepository.GetListAsync(x => x.RoleId == input.RoleId);
        foreach (var mapping in existingMappings)
        {
            await _roleMenuRepository.DeleteAsync(mapping);
        }

        // Add new role-menu mappings
        foreach (var menuId in input.MenuIds)
        {
            var roleMenu = new AppRoleMenu(input.RoleId, menuId);
            await _roleMenuRepository.InsertAsync(roleMenu);
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
