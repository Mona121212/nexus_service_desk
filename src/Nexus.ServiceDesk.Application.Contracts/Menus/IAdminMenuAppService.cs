using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Nexus.ServiceDesk.Menus.DTOs;

namespace Nexus.ServiceDesk.Menus;

public interface IAdminMenuAppService : IApplicationService
{
    Task<List<AppMenuDto>> GetListAsync();
    Task<AppMenuDto> CreateAsync(CreateAppMenuDto input);
    Task<AppMenuDto> UpdateAsync(Guid id, UpdateAppMenuDto input);
    Task DeleteAsync(Guid id);
}
