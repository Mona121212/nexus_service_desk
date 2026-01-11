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
public class AdminRepairRequestAppService : ServiceDeskAppService, IAdminRepairRequestAppService
{
    private readonly IRepository<RepairRequest, Guid> _repairRequestRepository;

    public AdminRepairRequestAppService(
        IRepository<RepairRequest, Guid> repairRequestRepository)
    {
        _repairRequestRepository = repairRequestRepository;
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsAdminList)]
    public async Task<PagedResultDto<RepairRequestListDto>> GetListAsync(GetRepairRequestListInput input)
    {
        var queryable = await _repairRequestRepository.GetQueryableAsync();
        var query = queryable.AsQueryable();

        if (input.ApprovalStatus.HasValue)
        {
            query = query.Where(x => x.ApprovalStatus == input.ApprovalStatus.Value);
        }

        if (input.IsCancelled.HasValue)
        {
            query = query.Where(x => x.IsCancelled == input.IsCancelled.Value);
        }

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

    [Authorize(ServiceDeskPermissions.RepairRequestsApprove)]
    public async Task<PagedResultDto<RepairRequestListDto>> GetApprovalsAsync(GetRepairRequestListInput input)
    {
        var queryable = await _repairRequestRepository.GetQueryableAsync();
        // Get only pending requests that are not cancelled and have been quoted
        var query = queryable.Where(x => 
            !x.IsCancelled && 
            x.ApprovalStatus == ApprovalStatus.Pending &&
            x.QuotedAmount.HasValue);

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

    [Authorize(ServiceDeskPermissions.RepairRequestsApprove)]
    public async Task<RepairRequestDetailDto> ApproveAsync(Guid id, ApproveRepairRequestDto input)
    {
        var repairRequest = await _repairRequestRepository.GetAsync(id);

        // Business rule: Can only approve pending requests
        if (repairRequest.ApprovalStatus != ApprovalStatus.Pending)
        {
            throw new BusinessException("InvalidOperation", "Can only approve repair requests with Pending status.");
        }

        if (repairRequest.IsCancelled)
        {
            throw new BusinessException("InvalidOperation", "Cannot approve a cancelled repair request.");
        }

        if (CurrentUser.Id == null)
        {
            throw new BusinessException("UserNotAuthenticated", "User must be authenticated.");
        }

        repairRequest.ApprovalStatus = ApprovalStatus.Approved;
        repairRequest.AdminId = CurrentUser.Id.Value;
        repairRequest.AdminDecisionNote = input.AdminDecisionNote;
        repairRequest.ApprovedAt = DateTime.UtcNow;

        await _repairRequestRepository.UpdateAsync(repairRequest);

        return ObjectMapper.Map<RepairRequest, RepairRequestDetailDto>(repairRequest);
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsReject)]
    public async Task<RepairRequestDetailDto> RejectAsync(Guid id, RejectRepairRequestDto input)
    {
        var repairRequest = await _repairRequestRepository.GetAsync(id);

        // Business rule: Can only reject pending requests
        if (repairRequest.ApprovalStatus != ApprovalStatus.Pending)
        {
            throw new BusinessException("InvalidOperation", "Can only reject repair requests with Pending status.");
        }

        if (repairRequest.IsCancelled)
        {
            throw new BusinessException("InvalidOperation", "Cannot reject a cancelled repair request.");
        }

        if (CurrentUser.Id == null)
        {
            throw new BusinessException("UserNotAuthenticated", "User must be authenticated.");
        }

        repairRequest.ApprovalStatus = ApprovalStatus.Rejected;
        repairRequest.AdminId = CurrentUser.Id.Value;
        repairRequest.AdminDecisionNote = input.AdminDecisionNote;
        repairRequest.ApprovedAt = DateTime.UtcNow;

        await _repairRequestRepository.UpdateAsync(repairRequest);

        return ObjectMapper.Map<RepairRequest, RepairRequestDetailDto>(repairRequest);
    }
}
