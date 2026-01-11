using System;
using Nexus.ServiceDesk.RepairRequests;
using Volo.Abp.Application.Dtos;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class RepairRequestDetailDto : FullAuditedEntityDto<Guid>
{
    public string RequestNo { get; set; } = string.Empty;

    public Guid TeacherId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string Room { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; }

    public bool IsCancelled { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledReason { get; set; }

    public Guid? ElectricianId { get; set; }
    public decimal? QuotedAmount { get; set; }
    public string Currency { get; set; } = "CAD";
    public string? ElectricianNote { get; set; }
    public DateTime? QuotedAt { get; set; }

    public ApprovalStatus ApprovalStatus { get; set; }
    public Guid? AdminId { get; set; }
    public string? AdminDecisionNote { get; set; }
    public DateTime? ApprovedAt { get; set; }
}
