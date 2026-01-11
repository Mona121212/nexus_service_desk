using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Nexus.ServiceDesk.RepairRequests.DTOs;

namespace Nexus.ServiceDesk.RepairRequests;

public interface IRepairRequestAppService : IApplicationService
{
    Task<RepairRequestDetailDto> CreateAsync(CreateRepairRequestDto input);
    Task<RepairRequestDetailDto> UpdateAsync(Guid id, UpdateRepairRequestDto input);
    Task<RepairRequestDetailDto> CancelAsync(Guid id, CancelRepairRequestDto input);
    Task<PagedResultDto<RepairRequestListDto>> GetMyListAsync(GetRepairRequestListInput input);
    Task<RepairRequestDetailDto> GetDetailAsync(Guid id);
}
