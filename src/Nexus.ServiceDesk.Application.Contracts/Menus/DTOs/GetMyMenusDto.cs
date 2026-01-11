using System.Collections.Generic;

namespace Nexus.ServiceDesk.Menus.DTOs;

public class GetMyMenusDto
{
    public List<AppMenuDto> Menus { get; set; } = new();
}
