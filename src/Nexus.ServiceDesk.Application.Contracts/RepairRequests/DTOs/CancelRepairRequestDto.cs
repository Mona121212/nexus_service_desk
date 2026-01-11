using System.ComponentModel.DataAnnotations;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class CancelRepairRequestDto
{
    [Required]
    public string CancelledReason { get; set; } = string.Empty;
}
