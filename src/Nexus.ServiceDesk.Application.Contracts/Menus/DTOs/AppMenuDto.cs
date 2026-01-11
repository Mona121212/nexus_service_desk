using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace Nexus.ServiceDesk.Menus.DTOs;

public class AppMenuDto : FullAuditedEntityDto<Guid>
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string? Icon { get; set; }
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; }
    public bool IsEnabled { get; set; }

    public List<AppMenuDto> Children { get; set; } = new();
}
