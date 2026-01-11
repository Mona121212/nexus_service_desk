using System;
using Volo.Abp.Domain.Entities;

namespace Nexus.ServiceDesk.AppMenus;

public class AppRoleMenu : Entity
{
    public Guid RoleId { get; set; }
    public Guid MenuId { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public AppMenu? Menu { get; set; }

    protected AppRoleMenu()
    {
    }

    public AppRoleMenu(Guid roleId, Guid menuId)
    {
        RoleId = roleId;
        MenuId = menuId;
        CreatedAt = DateTime.UtcNow;
    }

    public override object[] GetKeys()
    {
        return new object[] { RoleId, MenuId };
    }
}
