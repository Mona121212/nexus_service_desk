using Nexus.ServiceDesk.RepairRequests;
using Nexus.ServiceDesk.RepairRequests.DTOs;
using Volo.Abp.Mapperly;
using Riok.Mapperly.Abstractions;

namespace Nexus.ServiceDesk.RepairRequests;

[Mapper]
public partial class RepairRequestMapper : MapperBase<RepairRequest, RepairRequestListDto>
{
    // Mapperly automatically generates mapping logic at compile time.
    // If property names do not match exactly, you can use the [MapProperty] attribute to configure the mapping.

    public override partial RepairRequestListDto Map(RepairRequest source);
    
    public override partial void Map(RepairRequest source, RepairRequestListDto destination);
}
