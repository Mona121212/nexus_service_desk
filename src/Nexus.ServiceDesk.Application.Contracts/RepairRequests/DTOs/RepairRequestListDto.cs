using System;
using Nexus.ServiceDesk.RepairRequests;
using Volo.Abp.Application.Dtos;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class RepairRequestListDto : EntityDto<Guid>
{
    public string RequestNo { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string Room { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; }
    public bool IsCancelled { get; set; }
    public decimal? QuotedAmount { get; set; }
    public string Currency { get; set; } = "CAD";
}
