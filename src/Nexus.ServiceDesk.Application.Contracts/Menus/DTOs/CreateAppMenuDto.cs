using System;
using System.ComponentModel.DataAnnotations;

namespace Nexus.ServiceDesk.Menus.DTOs;

public class CreateAppMenuDto
{
    [Required]
    [StringLength(64)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(128)]
    public string Name { get; set; } = string.Empty;

    [StringLength(256)]
    public string? Path { get; set; }

    [StringLength(64)]
    public string? Icon { get; set; }

    public Guid? ParentId { get; set; }

    public int SortOrder { get; set; }

    public bool IsEnabled { get; set; } = true;
}
