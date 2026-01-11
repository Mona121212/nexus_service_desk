using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Nexus.ServiceDesk.RepairRequests;

public class RepairRequest : FullAuditedAggregateRoot<Guid>
{
    public string RequestNo { get; set; } = string.Empty;

    // Teacher (ABP user id)
    public Guid TeacherId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string Room { get; set; } = string.Empty;

    public DateTime SubmittedAt { get; set; }

    // Teacher cancel
    public bool IsCancelled { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledReason { get; set; }

    // Electrician quote (editable while approval_status='Pending')
    public Guid? ElectricianId { get; set; }
    public decimal? QuotedAmount { get; set; }
    public string Currency { get; set; } = "CAD";
    public string? ElectricianNote { get; set; }
    public DateTime? QuotedAt { get; set; }

    // Admin approval
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public Guid? AdminId { get; set; }
    public string? AdminDecisionNote { get; set; }
    public DateTime? ApprovedAt { get; set; }

    protected RepairRequest()
    {
    }

    public RepairRequest(
        Guid id,
        string requestNo,
        Guid teacherId,
        string title,
        string description,
        string building,
        string room)
        : base(id)
    {
        RequestNo = requestNo;
        TeacherId = teacherId;
        Title = title;
        Description = description;
        Building = building;
        Room = room;
        SubmittedAt = DateTime.UtcNow;
    }
}
