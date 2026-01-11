using Nexus.ServiceDesk.Samples;
using Xunit;

namespace Nexus.ServiceDesk.EntityFrameworkCore.Domains;

[Collection(ServiceDeskTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<ServiceDeskEntityFrameworkCoreTestModule>
{

}
