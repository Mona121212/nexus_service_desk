using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Nexus.ServiceDesk.RepairRequests.DTOs;

namespace Nexus.ServiceDesk.RepairRequests;

public interface IAdminRepairRequestAppService : IApplicationService
{
    Task<PagedResultDto<RepairRequestListDto>> GetListAsync(GetRepairRequestListInput input);
    Task<PagedResultDto<RepairRequestListDto>> GetApprovalsAsync(GetRepairRequestListInput input);
    Task<RepairRequestDetailDto> ApproveAsync(Guid id, ApproveRepairRequestDto input);
    Task<RepairRequestDetailDto> RejectAsync(Guid id, RejectRepairRequestDto input);
}
