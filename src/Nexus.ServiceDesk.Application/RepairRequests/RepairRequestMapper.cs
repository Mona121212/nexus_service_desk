using Nexus.ServiceDesk.RepairRequests;
using Nexus.ServiceDesk.RepairRequests.DTOs;
using Volo.Abp.Mapperly;
using Riok.Mapperly.Abstractions;

namespace Nexus.ServiceDesk.RepairRequests;

[Mapper]
public partial class RepairRequestMapper : MapperBase<RepairRequest, RepairRequestListDto>
{
    // Mapperly 会在编译时自动生成映射逻辑
    // 如果属性名称不完全一致，可以在这里使用 [MapProperty] 特性标注
    public override partial RepairRequestListDto Map(RepairRequest source);
    
    public override partial void Map(RepairRequest source, RepairRequestListDto destination);
}
