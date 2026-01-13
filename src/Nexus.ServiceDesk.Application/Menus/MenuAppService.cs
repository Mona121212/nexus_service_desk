using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Identity;
using Nexus.ServiceDesk.AppMenus;
using Nexus.ServiceDesk.Menus;
using Nexus.ServiceDesk.Menus.DTOs;

namespace Nexus.ServiceDesk.Menus;

public class MenuAppService : ServiceDeskAppService, IMenuAppService
{
    private readonly IRepository<AppMenu, Guid> _menuRepository;
    private readonly IRepository<AppRoleMenu> _roleMenuRepository;
    private readonly IIdentityUserRepository _userRepository;
    // Define the Mapper instance inside the class
    private static readonly ServiceDeskApplicationMappers _myMapper = new();

    public MenuAppService(
        IRepository<AppMenu, Guid> menuRepository,
        IRepository<AppRoleMenu> roleMenuRepository,
        IIdentityUserRepository userRepository)
    {
        _menuRepository = menuRepository;
        _roleMenuRepository = roleMenuRepository;
        _userRepository = userRepository;
    }

    public async Task<GetMyMenusDto> GetMyMenusAsync()
    {
        if (CurrentUser.Id == null)
        {
            return new GetMyMenusDto { Menus = new List<AppMenuDto>() };
        }

        // Get user roles
        var user = await _userRepository.GetAsync(CurrentUser.Id.Value);
        // Check if Roles is null or empty
        if (user.Roles == null || !user.Roles.Any())
        {
            return new GetMyMenusDto { Menus = new List<AppMenuDto>() };
        }
        var roleIds = user.Roles.Select(r => r.RoleId).ToList();

        if (roleIds.Count == 0)
        {
            return new GetMyMenusDto { Menus = new List<AppMenuDto>() };
        }

        // Get menu IDs for user's roles
        var roleMenus = await _roleMenuRepository.GetListAsync(x => roleIds.Contains(x.RoleId));
        var menuIds = roleMenus.Select(x => x.MenuId).Distinct().ToList();

        if (menuIds.Count == 0)
        {
            return new GetMyMenusDto { Menus = new List<AppMenuDto>() };
        }

        // Get enabled menus
        var menus = await _menuRepository.GetListAsync(x => menuIds.Contains(x.Id) && x.IsEnabled);
        var menuDtos = menus.Select(m => _myMapper.Map(m)).ToList();

        // Build tree structure
        var rootMenus = menuDtos.Where(x => x.ParentId == null || !menuIds.Contains(x.ParentId.Value))
            .OrderBy(x => x.SortOrder).ToList();
        var childMenus = menuDtos.Where(x => x.ParentId != null && menuIds.Contains(x.ParentId.Value)).ToList();

        foreach (var rootMenu in rootMenus)
        {
            BuildMenuTree(rootMenu, childMenus, menuIds);
        }

        return new GetMyMenusDto { Menus = rootMenus };
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
