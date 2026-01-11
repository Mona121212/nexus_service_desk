using System.ComponentModel.DataAnnotations;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class RejectRepairRequestDto
{
    [Required]
    public string AdminDecisionNote { get; set; } = string.Empty;
}
