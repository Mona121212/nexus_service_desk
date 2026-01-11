using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;
using Volo.Abp.Users;
using Volo.Abp;
using Nexus.ServiceDesk.Permissions;
using Nexus.ServiceDesk.RepairRequests;
using Nexus.ServiceDesk.RepairRequests.DTOs;

namespace Nexus.ServiceDesk.RepairRequests;

[Authorize]
public class RepairRequestAppService : ServiceDeskAppService, IRepairRequestAppService
{
    private readonly IRepository<RepairRequest, Guid> _repairRequestRepository;
    private readonly IGuidGenerator _guidGenerator;
    // 1. Define the Mapper instance inside the class
    private static readonly ServiceDeskApplicationMappers _myMapper = new();

    public RepairRequestAppService(
        IRepository<RepairRequest, Guid> repairRequestRepository,
        IGuidGenerator guidGenerator)
    {
        _repairRequestRepository = repairRequestRepository;
        _guidGenerator = guidGenerator;
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsCreate)]
    public async Task<RepairRequestDetailDto> CreateAsync(CreateRepairRequestDto input)
    {
        if (CurrentUser.Id == null)
        {
            throw new BusinessException("UserNotAuthenticated", "User must be authenticated to create repair requests.");
        }

        var requestNo = GenerateRequestNo();
        var repairRequest = new RepairRequest(
            _guidGenerator.Create(),
            requestNo,
            CurrentUser.Id.Value,
            input.Title,
            input.Description,
            input.Building,
            input.Room
        );

        await _repairRequestRepository.InsertAsync(repairRequest);

        // This ensures that mapping issues are detected at compile time rather than at runtime.
        return _myMapper.Map(repairRequest);
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsUpdate)]
    public async Task<RepairRequestDetailDto> UpdateAsync(Guid id, UpdateRepairRequestDto input)
    {
        var repairRequest = await _repairRequestRepository.GetAsync(id);

        // Only teacher who created it can update
        if (repairRequest.TeacherId != CurrentUser.Id)
        {
            throw new BusinessException("Unauthorized", "You can only update your own repair requests.");
        }

        // Business rule: Can only update when not cancelled and pending
        if (repairRequest.IsCancelled)
        {
            throw new BusinessException("InvalidOperation", "Cannot update a cancelled repair request.");
        }

        if (repairRequest.ApprovalStatus != ApprovalStatus.Pending)
        {
            throw new BusinessException("InvalidOperation", "Can only update repair requests with Pending status.");
        }

        repairRequest.Title = input.Title;
        repairRequest.Description = input.Description;
        repairRequest.Building = input.Building;
        repairRequest.Room = input.Room;

        await _repairRequestRepository.UpdateAsync(repairRequest);

        return _myMapper.Map(repairRequest);
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsCancel)]
    public async Task<RepairRequestDetailDto> CancelAsync(Guid id, CancelRepairRequestDto input)
    {
        var repairRequest = await _repairRequestRepository.GetAsync(id);

        // Only teacher who created it can cancel
        if (repairRequest.TeacherId != CurrentUser.Id)
        {
            throw new BusinessException("Unauthorized", "You can only cancel your own repair requests.");
        }

        // Business rule: Cannot cancel if already cancelled or approved
        if (repairRequest.IsCancelled)
        {
            throw new BusinessException("InvalidOperation", "Repair request is already cancelled.");
        }

        if (repairRequest.ApprovalStatus == ApprovalStatus.Approved)
        {
            throw new BusinessException("InvalidOperation", "Cannot cancel an approved repair request.");
        }

        repairRequest.IsCancelled = true;
        repairRequest.CancelledAt = DateTime.UtcNow;
        repairRequest.CancelledReason = input.CancelledReason;

        await _repairRequestRepository.UpdateAsync(repairRequest);

        return _myMapper.Map(repairRequest);
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsMyList)]
    public async Task<PagedResultDto<RepairRequestListDto>> GetMyListAsync(GetRepairRequestListInput input)
    {
        if (CurrentUser.Id == null)
        {
            throw new BusinessException("UserNotAuthenticated", "User must be authenticated.");
        }

        var queryable = await _repairRequestRepository.GetQueryableAsync();
        var query = queryable.Where(x => x.TeacherId == CurrentUser.Id);

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
            entities.Select(e => _myMapper.MapToList(e)).ToList()
        );
    }

    [Authorize(ServiceDeskPermissions.RepairRequestsDetail)]
    public async Task<RepairRequestDetailDto> GetDetailAsync(Guid id)
    {
        var repairRequest = await _repairRequestRepository.GetAsync(id);

        // Check permissions: owner can always view, or user with admin/electrician permissions
        if (repairRequest.TeacherId != CurrentUser.Id)
        {
            var hasAdminPermission = await AuthorizationService.IsGrantedAsync(ServiceDeskPermissions.RepairRequestsAdminList);
            var hasElectricianPermission = await AuthorizationService.IsGrantedAsync(ServiceDeskPermissions.RepairRequestsElectricianList);

            if (!hasAdminPermission && !hasElectricianPermission)
            {
                throw new BusinessException("Unauthorized", "You don't have permission to view this repair request.");
            }
        }

        return _myMapper.Map(repairRequest);
    }

    private string GenerateRequestNo()
    {
        // Generate request number: RR + YYYYMMDD + 6 random digits
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randomPart = new Random().Next(100000, 999999).ToString();
        return $"RR{datePart}{randomPart}";
    }
}
