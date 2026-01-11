using Volo.Abp.Modularity;

namespace Nexus.ServiceDesk;

public abstract class ServiceDeskApplicationTestBase<TStartupModule> : ServiceDeskTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
