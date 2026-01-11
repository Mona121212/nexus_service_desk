using Nexus.ServiceDesk.Samples;
using Xunit;

namespace Nexus.ServiceDesk.EntityFrameworkCore.Applications;

[Collection(ServiceDeskTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<ServiceDeskEntityFrameworkCoreTestModule>
{

}
