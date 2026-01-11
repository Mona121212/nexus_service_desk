using Xunit;

namespace Nexus.ServiceDesk.EntityFrameworkCore;

[CollectionDefinition(ServiceDeskTestConsts.CollectionDefinitionName)]
public class ServiceDeskEntityFrameworkCoreCollection : ICollectionFixture<ServiceDeskEntityFrameworkCoreFixture>
{

}
