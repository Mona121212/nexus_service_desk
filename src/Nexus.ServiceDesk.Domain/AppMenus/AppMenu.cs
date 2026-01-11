using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace Nexus.ServiceDesk.AppMenus;

public class AppMenu : FullAuditedAggregateRoot<Guid>
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string? Icon { get; set; }
    public Guid? ParentId { get; set; }
    public int SortOrder { get; set; }
    public bool IsEnabled { get; set; } = true;

    // Navigation properties
    public AppMenu? Parent { get; set; }
    public ICollection<AppMenu> Children { get; set; } = new List<AppMenu>();

    protected AppMenu()
    {
    }

    public AppMenu(
        Guid id,
        string code,
        string name,
        Guid? parentId = null)
        : base(id)
    {
        Code = code;
        Name = name;
        ParentId = parentId;
    }
}
