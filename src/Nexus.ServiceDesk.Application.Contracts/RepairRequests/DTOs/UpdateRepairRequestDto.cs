using System.ComponentModel.DataAnnotations;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class UpdateRepairRequestDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Building { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Room { get; set; } = string.Empty;
}
