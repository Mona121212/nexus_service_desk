using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Nexus.ServiceDesk.Menus.DTOs;

namespace Nexus.ServiceDesk.Menus;

public interface IMenuAppService : IApplicationService
{
    Task<GetMyMenusDto> GetMyMenusAsync();
}
