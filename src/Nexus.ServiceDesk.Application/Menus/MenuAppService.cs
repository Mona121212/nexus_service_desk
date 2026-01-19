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

        // Get user roles using GetRolesAsync method to ensure roles are properly loaded
        var userRoles = await _userRepository.GetRolesAsync(CurrentUser.Id.Value);

        if (userRoles == null || !userRoles.Any())
        {
            return new GetMyMenusDto { Menus = new List<AppMenuDto>() };
        }

        var roleIds = userRoles.Select(r => r.Id).ToList();

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

        // Get enabled menus that user has permission to access
        var menus = await _menuRepository.GetListAsync(x => menuIds.Contains(x.Id) && x.IsEnabled);

        // If menus have parent menus, we need to include parent menus even if they are not directly assigned
        // This ensures the menu tree structure is complete
        // Recursively find all parent menus
        var menuIdsWithParents = new HashSet<Guid>(menuIds);
        var parentIdsToCheck = new HashSet<Guid>();

        // First pass: collect all immediate parent IDs
        foreach (var menu in menus)
        {
            if (menu.ParentId.HasValue && !menuIdsWithParents.Contains(menu.ParentId.Value))
            {
                parentIdsToCheck.Add(menu.ParentId.Value);
            }
        }

        // Recursively find all parent menus up to the root
        while (parentIdsToCheck.Count > 0)
        {
            var currentParentIds = parentIdsToCheck.ToList();
            parentIdsToCheck.Clear();

            var parentMenus = await _menuRepository.GetListAsync(x => currentParentIds.Contains(x.Id) && x.IsEnabled);
            foreach (var parentMenu in parentMenus)
            {
                menuIdsWithParents.Add(parentMenu.Id);

                // Check if this parent menu also has a parent
                if (parentMenu.ParentId.HasValue && !menuIdsWithParents.Contains(parentMenu.ParentId.Value))
                {
                    parentIdsToCheck.Add(parentMenu.ParentId.Value);
                }
            }
        }

        // Fetch all menus including parent menus that are needed for tree structure
        var allMenus = await _menuRepository.GetListAsync(x => menuIdsWithParents.Contains(x.Id) && x.IsEnabled);
        var menuDtos = allMenus.Select(m => _myMapper.Map(m)).ToList();

        // Build tree structure
        // IMPORTANT: Only return menus that are directly assigned to user's roles (menuIds)
        // Parent menus are included in menuIdsWithParents only for tree structure building,
        // but we should NOT return parent menus as root menus unless they are also directly assigned
        // Root menus are those that:
        // 1. Are directly assigned to user's roles (in menuIds, not just menuIdsWithParents)
        // 2. Have no parent OR their parent is not directly assigned to user's roles
        var rootMenus = menuDtos
            .Where(x => menuIds.Contains(x.Id) && (x.ParentId == null || !menuIds.Contains(x.ParentId.Value)))
            .OrderBy(x => x.SortOrder)
            .ToList();
        // Child menus are those that are directly assigned AND have a parent that is also directly assigned
        var childMenus = menuDtos.Where(x => menuIds.Contains(x.Id) && x.ParentId != null && menuIds.Contains(x.ParentId.Value)).ToList();

        foreach (var rootMenu in rootMenus)
        {
            BuildMenuTree(rootMenu, childMenus, menuIds);
        }

        return new GetMyMenusDto { Menus = rootMenus };
    }

    private void BuildMenuTree(AppMenuDto parent, List<AppMenuDto> allMenus, ICollection<Guid> allowedMenuIds)
    {
        // Only include children that are in the allowed menu list (directly assigned to user's roles)
        var children = allMenus
            .Where(x => x.ParentId == parent.Id && allowedMenuIds.Contains(x.Id))
            .OrderBy(x => x.SortOrder)
            .ToList();
        parent.Children = children;

        foreach (var child in children)
        {
            BuildMenuTree(child, allMenus, allowedMenuIds);
        }
    }
}
