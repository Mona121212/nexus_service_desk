using System.Collections.Generic;
using System.Linq;
using Nexus.ServiceDesk.RepairRequests;
using Nexus.ServiceDesk.RepairRequests.DTOs;
using Nexus.ServiceDesk.AppMenus;
using Nexus.ServiceDesk.Menus.DTOs;
using Riok.Mapperly.Abstractions;

namespace Nexus.ServiceDesk;

[Mapper]
public partial class ServiceDeskApplicationMappers
{
    // The method name must be "Map" and it must be declared as partial
    // The first parameter is the database entity (Source), and the return type is the DTO (Target)
    public partial RepairRequestDetailDto Map(RepairRequest source);

    // If you also use a list view, it is recommended to add this mapping as well
    public partial RepairRequestListDto MapToList(RepairRequest source);

    // Menu mapping
    public partial AppMenuDto Map(AppMenu source);

    // Manual implementation for List mappings to support ObjectMapper.Map<List<TSource>, List<TDestination>>
    // Mapperly doesn't auto-generate List mappings, so we implement them manually
    public List<RepairRequestDetailDto> Map(List<RepairRequest> source)
    {
        return source.Select(m => Map(m)).ToList();
    }

    public List<RepairRequestListDto> MapToList(List<RepairRequest> source)
    {
        return source.Select(m => MapToList(m)).ToList();
    }

    public List<AppMenuDto> Map(List<AppMenu> source)
    {
        return source.Select(m => Map(m)).ToList();
    }
}
