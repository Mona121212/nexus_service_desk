using Volo.Abp.Modularity;

namespace Nexus.ServiceDesk;

[DependsOn(
    typeof(ServiceDeskDomainModule),
    typeof(ServiceDeskTestBaseModule)
)]
public class ServiceDeskDomainTestModule : AbpModule
{

}
