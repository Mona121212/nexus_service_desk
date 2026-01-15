using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using Nexus.ServiceDesk.Permissions;
using Nexus.ServiceDesk.RepairRequests;
using Nexus.ServiceDesk.RepairRequests.DTOs;

namespace Nexus.ServiceDesk.RepairRequests;

[Authorize]
public class ElectricianRepairRequestAppService : ServiceDeskAppService, IElectricianRepairRequestAppService
{
    private readonly IRepository<RepairRequest, Guid> _repairRequestRepository;

    public ElectricianRepairRequestAppService(
        IRepository<RepairRequest, Guid> repairRequestRepository)
    {
        _repairRequestRepository = repairRequestRepository;
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsElectricianList)]
    public async Task<PagedResultDto<RepairRequestListDto>> GetListAsync(GetRepairRequestListInput input)
    {
        var queryable = await _repairRequestRepository.GetQueryableAsync();
        // Electrician can only see pending and not cancelled requests
        var query = queryable.Where(x => !x.IsCancelled && x.ApprovalStatus == ApprovalStatus.Pending);

        if (!string.IsNullOrWhiteSpace(input.Building))
        {
            query = query.Where(x => x.Building.Contains(input.Building));
        }

        if (!string.IsNullOrWhiteSpace(input.Room))
        {
            query = query.Where(x => x.Room.Contains(input.Room));
        }

        var totalCount = await AsyncExecuter.CountAsync(query);

        // Apply sorting
        if (!string.IsNullOrWhiteSpace(input.Sorting))
        {
            query = input.Sorting.ToUpper().EndsWith(" DESC")
                ? query.OrderByDescending(x => x.CreationTime)
                : query.OrderBy(x => x.CreationTime);
        }
        else
        {
            query = query.OrderByDescending(x => x.CreationTime);
        }

        // Apply paging
        query = query.Skip(input.SkipCount).Take(input.MaxResultCount);

        var entities = await AsyncExecuter.ToListAsync(query);

        return new PagedResultDto<RepairRequestListDto>(
            totalCount,
            ObjectMapper.Map<List<RepairRequest>, List<RepairRequestListDto>>(entities)
        );
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsQuote)]
    public async Task<RepairRequestDetailDto> QuoteAsync(Guid id, QuoteRepairRequestDto input)
    {
        var repairRequest = await _repairRequestRepository.GetAsync(id);

        // Business rule: Can only quote pending requests
        if (repairRequest.ApprovalStatus != ApprovalStatus.Pending)
        {
            throw new BusinessException("InvalidOperation", "Can only quote repair requests with Pending status.");
        }

        if (repairRequest.IsCancelled)
        {
            throw new BusinessException("InvalidOperation", "Cannot quote a cancelled repair request.");
        }

        if (CurrentUser.Id == null)
        {
            throw new BusinessException("UserNotAuthenticated", "User must be authenticated.");
        }

        repairRequest.ElectricianId = CurrentUser.Id.Value;
        repairRequest.QuotedAmount = input.QuotedAmount;
        repairRequest.Currency = input.Currency;
        repairRequest.ElectricianNote = input.ElectricianNote;
        repairRequest.QuotedAt = DateTime.UtcNow;

        await _repairRequestRepository.UpdateAsync(repairRequest);

        return ObjectMapper.Map<RepairRequest, RepairRequestDetailDto>(repairRequest);
    }
}
