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
}
