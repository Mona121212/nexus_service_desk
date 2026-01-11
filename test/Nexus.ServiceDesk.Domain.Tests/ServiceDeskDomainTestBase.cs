using Volo.Abp.Modularity;

namespace Nexus.ServiceDesk;

/* Inherit from this class for your domain layer tests. */
public abstract class ServiceDeskDomainTestBase<TStartupModule> : ServiceDeskTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
