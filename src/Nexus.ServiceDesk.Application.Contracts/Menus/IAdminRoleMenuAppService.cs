using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Nexus.ServiceDesk.Menus.DTOs;

namespace Nexus.ServiceDesk.Menus;

public interface IAdminRoleMenuAppService : IApplicationService
{
    Task<List<AppMenuDto>> GetByRoleAsync(Guid roleId);
    Task SaveAsync(SetRoleMenusDto input);
}
