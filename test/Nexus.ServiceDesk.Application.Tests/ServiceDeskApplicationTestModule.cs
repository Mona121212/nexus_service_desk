using Volo.Abp.Modularity;

namespace Nexus.ServiceDesk;

[DependsOn(
    typeof(ServiceDeskApplicationModule),
    typeof(ServiceDeskDomainTestModule)
)]
public class ServiceDeskApplicationTestModule : AbpModule
{

}
