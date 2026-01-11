using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Nexus.ServiceDesk.RepairRequests.DTOs;

namespace Nexus.ServiceDesk.RepairRequests;

public interface IElectricianRepairRequestAppService : IApplicationService
{
    Task<PagedResultDto<RepairRequestListDto>> GetListAsync(GetRepairRequestListInput input);
    Task<RepairRequestDetailDto> QuoteAsync(Guid id, QuoteRepairRequestDto input);
}
