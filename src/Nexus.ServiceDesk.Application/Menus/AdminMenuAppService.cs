using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Nexus.ServiceDesk.Permissions;
using Nexus.ServiceDesk.AppMenus;
using Nexus.ServiceDesk.Menus;
using Nexus.ServiceDesk.Menus.DTOs;

namespace Nexus.ServiceDesk.Menus;

[Authorize(ServiceDeskPermissions.MenusManage)]
public class AdminMenuAppService : ServiceDeskAppService, IAdminMenuAppService
{
    private readonly IRepository<AppMenu, Guid> _menuRepository;
    private readonly IGuidGenerator _guidGenerator;
    // Use direct mapper instance instead of ABP ObjectMapper
    private static readonly ServiceDeskApplicationMappers _myMapper = new();

    public AdminMenuAppService(
        IRepository<AppMenu, Guid> menuRepository,
        IGuidGenerator guidGenerator)
    {
        _menuRepository = menuRepository;
        _guidGenerator = guidGenerator;
    }

    [Authorize(ServiceDeskPermissions.MenusManage)]
    public async Task<List<AppMenuDto>> GetListAsync()
    {
        var menus = await _menuRepository.GetListAsync();
        // Use direct mapper instance instead of ABP ObjectMapper
        return menus.Select(menu => _myMapper.Map(menu)).ToList();
    }

    [Authorize(ServiceDeskPermissions.MenusManage)]
    public async Task<AppMenuDto> CreateAsync(CreateAppMenuDto input)
    {
        var menu = new AppMenu(
            _guidGenerator.Create(),
            input.Code,
            input.Name,
            input.ParentId
        )
        {
            Path = input.Path,
            Icon = input.Icon,
            SortOrder = input.SortOrder,
            IsEnabled = input.IsEnabled
        };

        await _menuRepository.InsertAsync(menu);

        return _myMapper.Map(menu);
    }

    [Authorize(ServiceDeskPermissions.MenusManage)]
    public async Task<AppMenuDto> UpdateAsync(Guid id, UpdateAppMenuDto input)
    {
        var menu = await _menuRepository.GetAsync(id);

        menu.Name = input.Name;
        menu.Path = input.Path;
        menu.Icon = input.Icon;
        menu.ParentId = input.ParentId;
        menu.SortOrder = input.SortOrder;
        menu.IsEnabled = input.IsEnabled;

        await _menuRepository.UpdateAsync(menu);

        return _myMapper.Map(menu);
    }

    [Authorize(ServiceDeskPermissions.MenusManage)]
    public async Task DeleteAsync(Guid id)
    {
        await _menuRepository.DeleteAsync(id);
    }
}
