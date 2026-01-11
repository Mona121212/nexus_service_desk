using System.ComponentModel.DataAnnotations;

namespace Nexus.ServiceDesk.RepairRequests.DTOs;

public class QuoteRepairRequestDto
{
    [Required]
    [Range(0.01, 9999999999.99)]
    public decimal QuotedAmount { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = "CAD";

    public string? ElectricianNote { get; set; }
}
