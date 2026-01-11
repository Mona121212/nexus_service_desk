using System;
using System.Collections.Generic;

namespace Nexus.ServiceDesk.Menus.DTOs;

public class SetRoleMenusDto
{
    public Guid RoleId { get; set; }
    public List<Guid> MenuIds { get; set; } = new();
}
