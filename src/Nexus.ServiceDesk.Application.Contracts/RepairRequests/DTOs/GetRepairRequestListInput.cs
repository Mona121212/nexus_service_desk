using Nexus.ServiceDesk.RepairRequests;
using Volo.Abp.Application.Dtos;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class GetRepairRequestListInput : PagedAndSortedResultRequestDto
{
    public ApprovalStatus? ApprovalStatus { get; set; }
    public bool? IsCancelled { get; set; }
    public string? Building { get; set; }
    public string? Room { get; set; }
}
